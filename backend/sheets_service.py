import re
import logging
import json
import os
from datetime import datetime, date
from collections import defaultdict
from typing import Dict, List, Optional
import gspread
from oauth2client.service_account import ServiceAccountCredentials

logger = logging.getLogger(__name__)

DATE_FMT = "%d.%m.%Y"
DATE_RX = re.compile(r"\d{2}\.\d{2}\.\d{4}$")
HEADER_ROWS = 4

class SheetsService:
    def __init__(self, credentials_path: str = "credentials.json"):
        scope = [
            "https://spreadsheets.google.com/feeds",
            "https://www.googleapis.com/auth/spreadsheets",
            "https://www.googleapis.com/auth/drive.file",
            "https://www.googleapis.com/auth/drive",
        ]
        
        # Читаем credentials из переменной окружения или файла
        google_creds_json = os.getenv("GOOGLE_CREDENTIALS")
        if google_creds_json:
            # Если есть в переменной - парсим JSON
            creds_dict = json.loads(google_creds_json)
            creds = ServiceAccountCredentials.from_json_keyfile_dict(creds_dict, scope)
            logger.info("✅ Credentials загружены из переменной окружения")
        else:
            # Если нет - читаем из файла (для локальной разработки)
            creds = ServiceAccountCredentials.from_json_keyfile_name(credentials_path, scope)
            logger.info("✅ Credentials загружены из файла")
        
        self.sheet = gspread.authorize(creds).open("TelegramBotData").sheet1
        logger.info("✅ Sheets подключен")
    
    @staticmethod
    def safe_float(s: str) -> Optional[float]:
        try:
            return float(s.replace(",", "."))
        except:
            return None
    
    @staticmethod
    def is_date(s: str) -> bool:
        return bool(DATE_RX.fullmatch(s.strip()))
    
    @staticmethod
    def pdate(s: str) -> date:
        return datetime.strptime(s, DATE_FMT).date()
    
    def read_sheet(self) -> Dict[str, List[Dict]]:
        """Чтение всех данных из Google Sheets"""
        data = defaultdict(list)
        
        try:
            for idx, row in enumerate(self.sheet.get_all_values(), start=1):
                if idx <= HEADER_ROWS or len(row) < 2:
                    continue
                
                d = row[0].strip()
                if not self.is_date(d):
                    continue
                
                amt = self.safe_float(row[2]) if len(row) > 2 else None
                sal = self.safe_float(row[3]) if len(row) > 3 else None
                
                if amt is None and sal is None:
                    continue
                
                entry = {
                    "date": d,
                    "symbols": row[1].strip(),
                    "row_idx": idx
                }
                
                if sal is not None:
                    entry["salary"] = sal
                else:
                    entry["amount"] = amt
                
                dt_obj = self.pdate(d)
                key = f"{dt_obj.year}-{dt_obj.month:02d}"
                data[key].append(entry)
                
        except Exception as e:
            logger.error(f"Ошибка чтения Sheets: {e}")
        
        return dict(data)
    
    def push_row(self, entry: Dict) -> int:
        """Добавление новой строки"""
        try:
            nd = self.pdate(entry["date"])
            row = [
                entry["date"],
                entry.get("symbols", ""),
                entry.get("amount", ""),
                entry.get("salary", "")
            ]
            
            col = self.sheet.col_values(1)[HEADER_ROWS:]
            ins = HEADER_ROWS
            
            for i, v in enumerate(col, start=HEADER_ROWS + 1):
                try:
                    if self.pdate(v) <= nd:
                        ins = i
                    else:
                        break
                except:
                    continue
            
            self.sheet.insert_row(row, ins + 1, value_input_option="USER_ENTERED")
            logger.info(f"✅ Добавлена строка {ins + 1}")
            return ins + 1
            
        except Exception as e:
            logger.error(f"Ошибка добавления строки: {e}")
            return -1
    
    def update_row(self, idx: int, symbols: str, amount: float):
        """Обновление строки"""
        try:
            self.sheet.update_cell(idx, 2, symbols)
            self.sheet.update_cell(idx, 3, amount)
            logger.info(f"✅ Обновлена строка {idx}")
        except Exception as e:
            logger.error(f"Ошибка обновления строки: {e}")
    
    def delete_row(self, idx: int):
        """Удаление строки"""
        try:
            self.sheet.delete_rows(idx)
            logger.info(f"✅ Удалена строка {idx}")
        except Exception as e:
            logger.error(f"Ошибка удаления строки: {e}")
