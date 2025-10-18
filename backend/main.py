import asyncio
import json
import logging
from datetime import datetime, date, timedelta
from typing import Dict, List, Optional, Set
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import redis.asyncio as aioredis
from pydantic import BaseModel
import os
from dotenv import load_dotenv

from sheets_service import SheetsService
from clients_service import ClientsService

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger(__name__)

load_dotenv()

redis_client: Optional[aioredis.Redis] = None
sheets_service: Optional[SheetsService] = None
clients_service: Optional[ClientsService] = None
active_connections: Set[WebSocket] = set()

@asynccontextmanager
async def lifespan(app: FastAPI):
    global redis_client, sheets_service, clients_service
    
    try:
        redis_client = await aioredis.from_url(
            os.getenv("REDIS_URL", "redis://localhost:6379"),
            decode_responses=True
        )
        logger.info("✅ Redis подключен")
    except Exception as e:
        logger.error(f"❌ Redis: {e}")
    
    try:
        sheets_service = SheetsService()
        logger.info("✅ Google Sheets подключен")
    except Exception as e:
        logger.error(f"❌ Sheets: {e}")
    
    try:
        clients_service = ClientsService()
        logger.info("✅ Clients service инициализирован")
    except Exception as e:
        logger.error(f"❌ Clients: {e}")
    
    sync_task = asyncio.create_task(background_sync())
    
    yield
    
    sync_task.cancel()
    if redis_client:
        await redis_client.aclose()
    logger.info("🛑 Остановлено")

app = FastAPI(title="Salary Bot PWA", version="1.0.0", lifespan=lifespan)

# CORS: allow_credentials=True несовместим с allow_origins=["*"]
# Используем конкретные origins или отключаем credentials
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,  # Отключаем для работы с wildcard origins
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

async def background_sync():
    while True:
        try:
            await asyncio.sleep(5)
            await sync_data()
        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.error(f"Ошибка синхронизации: {e}")

async def sync_data():
    if not sheets_service or not redis_client:
        return
    
    try:
        data = sheets_service.read_sheet()
        await redis_client.set("entries", json.dumps(data), ex=300)
        
        if active_connections:
            message = {"type": "sync", "data": data}
            disconnected = set()
            for conn in active_connections:
                try:
                    await conn.send_json(message)
                except:
                    disconnected.add(conn)
            active_connections.difference_update(disconnected)
                    
        logger.info(f"✅ Синхронизация: {len(data)} периодов")
    except Exception as e:
        logger.error(f"Ошибка синхронизации: {e}")

async def get_cached_data() -> Dict:
    if not redis_client:
        return {}
    
    try:
        cached = await redis_client.get("entries")
        if cached:
            return json.loads(cached)
    except Exception as e:
        logger.error(f"Ошибка Redis: {e}")
    
    if sheets_service:
        data = sheets_service.read_sheet()
        await redis_client.set("entries", json.dumps(data), ex=300)
        return data
    
    return {}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.add(websocket)
    logger.info(f"WS подключен. Всего: {len(active_connections)}")
    
    try:
        data = await get_cached_data()
        await websocket.send_json({"type": "init", "data": data})
        
        while True:
            message = await websocket.receive_json()
            msg_type = message.get("type")
            
            if msg_type == "ping":
                await websocket.send_json({"type": "pong"})
            
            elif msg_type == "add_entry":
                entry_data = message.get("data")
                if sheets_service:
                    row_idx = sheets_service.push_row(entry_data)
                    await sync_data()
                    await websocket.send_json({"type": "entry_added", "row_idx": row_idx, "success": True})
            
            elif msg_type == "update_entry":
                if sheets_service:
                    sheets_service.update_row(message.get("idx"), message.get("symbols"), message.get("amount"))
                    await sync_data()
                    await websocket.send_json({"type": "entry_updated", "success": True})
            
            elif msg_type == "delete_entry":
                if sheets_service:
                    sheets_service.delete_row(message.get("idx"))
                    await sync_data()
                    await websocket.send_json({"type": "entry_deleted", "success": True})
            
    except WebSocketDisconnect:
        active_connections.discard(websocket)
        logger.info(f"WS отключен. Осталось: {len(active_connections)}")
    except Exception as e:
        logger.error(f"WS ошибка: {e}")
        active_connections.discard(websocket)

@app.get("/")
async def root():
    return {"status": "ok", "service": "Salary Bot PWA API"}

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy" if (redis_client and sheets_service) else "degraded",
        "redis": "ok" if redis_client else "error",
        "sheets": "ok" if sheets_service else "error",
        "connections": len(active_connections)
    }

@app.get("/api/entries")
async def get_entries():
    data = await get_cached_data()
    return {"data": data}

@app.get("/api/clients")
async def get_clients():
    if not clients_service:
        return {"clients": []}
    return {"clients": clients_service.get_all_clients()}

@app.get("/api/clients/analytics")
async def get_clients_analytics():
    """Получить аналитику по клиентам с обработкой на бэке"""
    try:
        data = await get_cached_data()
        
        if not data:
            logger.warning("No data in cache for clients analytics")
            return {"clients": [], "stats": {}}
        
        logger.info(f"Processing clients analytics from {len(data)} periods")
        
        # Группируем по клиентам
        clients_map = {}
        
        for period_key, period_entries in data.items():
            for entry in period_entries:
                symbols_raw = entry.get("symbols", "").strip()
                amount = entry.get("amount")
                date_str = entry.get("date", "")
                row_idx = entry.get("row_idx", "")
                
                if not symbols_raw or not amount:
                    continue
                
                # Нормализуем: убираем лишние пробелы
                symbols_normalized = " ".join(symbols_raw.split())
                # Для проверки используем версию БЕЗ пробелов
                symbols_no_spaces = symbols_normalized.replace(" ", "")
                
                # Определяем тип:
                # КОРОТКИЙ НИК (группируем ВСЕ записи):
                #   - начинается с @
                #   - очень короткий (<=3 символов БЕЗ пробелов), например "D M A" -> "DMA" (3), "МД" (2)
                # ИМЯ/ФАМИЛИЯ/ИМЯ+ФАМИЛИЯ (группируем только внутри ОДНОГО ДНЯ):
                #   - остальные случаи, например "Максим", "Дудко", "Иван Петров"
                
                is_short_nickname = (
                    symbols_no_spaces.startswith("@") or 
                    len(symbols_no_spaces) <= 3
                )
                
                # Для коротких ников - группируем ВСЕ записи (все даты)
                if is_short_nickname:
                    client_key = symbols_no_spaces.upper()
                else:
                    # Для имён/фамилий - группируем только внутри ОДНОГО дня
                    client_key = f"{symbols_normalized.lower()}_{date_str}"
                
                if client_key not in clients_map:
                    clients_map[client_key] = {
                        "id": client_key,
                        "name": symbols_normalized,  # Сохраняем оригинальное (нормализованное от пробелов) имя
                        "isNickname": is_short_nickname,
                        "totalRevenue": 0,
                        "transactionCount": 0,
                        "firstDate": date_str,
                        "lastDate": date_str,
                        "transactions": []
                    }
                
                client = clients_map[client_key]
                client["totalRevenue"] += amount
                client["transactionCount"] += 1
                
                # Обновляем даты
                if date_str < client["firstDate"]:
                    client["firstDate"] = date_str
                if date_str > client["lastDate"]:
                    client["lastDate"] = date_str
                
                # Добавляем транзакцию
                client["transactions"].append({
                    "date": date_str,
                    "amount": amount,
                    "id": str(row_idx)
                })
        
        logger.info(f"Grouped into {len(clients_map)} unique clients")
        
        # Считаем средний чек
        clients_list = []
        for client in clients_map.values():
            client["avgTransaction"] = client["totalRevenue"] / client["transactionCount"] if client["transactionCount"] > 0 else 0
            # Сортируем транзакции по дате (новые сверху)
            client["transactions"].sort(key=lambda x: x["date"], reverse=True)
            clients_list.append(client)
        
        # Сортируем по выручке
        clients_list.sort(key=lambda x: x["totalRevenue"], reverse=True)
        
        # Статистика
        stats = {
            "totalClients": len(clients_list),
            "totalRevenue": sum(c["totalRevenue"] for c in clients_list),
            "avgRevenuePerClient": sum(c["totalRevenue"] for c in clients_list) / len(clients_list) if clients_list else 0
        }
        
        logger.info(f"✅ Clients analytics: {stats['totalClients']} clients, {stats['totalRevenue']} total revenue")
        
        return {
            "clients": clients_list,
            "stats": stats
        }
    except Exception as e:
        logger.error(f"Error in clients analytics: {e}", exc_info=True)
        return {"clients": [], "stats": {}, "error": str(e)}

@app.get("/api/clients/search")
async def search_clients(q: str = ""):
    if not clients_service:
        return {"clients": []}
    if not q:
        return {"clients": clients_service.get_all_clients()}
    return {"clients": clients_service.search_clients(q)}

@app.post("/api/clients")
async def create_client(name: str, phone: str = "", email: str = "", notes: str = ""):
    if not clients_service:
        raise HTTPException(status_code=503, detail="Clients service unavailable")
    client = clients_service.add_or_update_client(name, phone, email, notes)
    return {"success": True, "client": client}

@app.get("/api/clients/{client_id}")
async def get_client(client_id: str):
    if not clients_service:
        raise HTTPException(status_code=503, detail="Clients service unavailable")
    client = clients_service.get_client(client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return {"client": client}

@app.delete("/api/clients/{client_id}")
async def delete_client(client_id: str):
    if not clients_service:
        raise HTTPException(status_code=503, detail="Clients service unavailable")
    success = clients_service.delete_client(client_id)
    if not success:
        raise HTTPException(status_code=404, detail="Client not found")
    return {"success": True}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8001"))
    uvicorn.run(app, host="0.0.0.0", port=port)
