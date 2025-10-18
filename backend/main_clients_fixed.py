# Вот правильная версия эндпоинта
@app.get("/api/clients/analytics")
async def get_clients_analytics():
    """Получить аналитику по клиентам с обработкой на бэке"""
    try:
        data = await get_cached_data()
        
        if not data:
            logger.warning("No data in cache for clients analytics")
            return {"clients": [], "stats": {}}
        
        logger.info(f"Processing clients analytics from {len(data)} periods")
        
        # Собираем все записи
        all_entries = []
        for period_key, period_entries in data.items():
            all_entries.extend(period_entries)
        
        logger.info(f"Total entries to process: {len(all_entries)}")
        
        # Группируем по клиентам
        clients_map = {}
        
        for entry in all_entries:
            symbols = entry.get("symbols", "").strip()
            amount = entry.get("amount")
            date_str = entry.get("date", "")
            row_idx = entry.get("row_idx", "")
            
            if not symbols or not amount:
                continue
            
            # Определяем это никнейм или имя
            is_nickname = symbols.startswith("@") or len(symbols) <= 3
            
            # Для имён (не никнеймов) - каждый день = новый человек
            if not is_nickname:
                # Создаём уникальный ID на основе имени + даты
                client_key = f"{symbols.lower()}_{date_str}"
            else:
                # Для никнеймов - группируем все записи
                client_key = symbols.lower()
            
            if client_key not in clients_map:
                clients_map[client_key] = {
                    "id": client_key,
                    "name": symbols,
                    "isNickname": is_nickname,
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
