import json
import logging
from typing import Dict, List, Optional
from datetime import datetime
import hashlib

logger = logging.getLogger(__name__)

class ClientsService:
    def __init__(self):
        self.clients_file = "clients.json"
        self.load_clients()
    
    def load_clients(self):
        """Загрузка клиентов из файла"""
        try:
            with open(self.clients_file, 'r', encoding='utf-8') as f:
                self.clients = json.load(f)
        except FileNotFoundError:
            self.clients = {}
            self.save_clients()
    
    def save_clients(self):
        """Сохранение клиентов в файл"""
        try:
            with open(self.clients_file, 'w', encoding='utf-8') as f:
                json.dump(self.clients, f, ensure_ascii=False, indent=2)
        except Exception as e:
            logger.error(f"Ошибка сохранения клиентов: {e}")
    
    def generate_client_id(self, name: str) -> str:
        """Генерация уникального ID для клиента"""
        return hashlib.md5(name.lower().encode()).hexdigest()[:12]
    
    def add_or_update_client(self, name: str, phone: str = "", email: str = "", notes: str = "") -> Dict:
        """Добавление или обновление клиента"""
        client_id = self.generate_client_id(name)
        
        if client_id in self.clients:
            # Обновляем существующего клиента
            client = self.clients[client_id]
            if phone:
                client['phone'] = phone
            if email:
                client['email'] = email
            if notes:
                client['notes'] = notes
            client['updated_at'] = datetime.now().isoformat()
        else:
            # Создаем нового клиента
            client = {
                'id': client_id,
                'name': name,
                'phone': phone,
                'email': email,
                'notes': notes,
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            }
            self.clients[client_id] = client
        
        self.save_clients()
        return client
    
    def get_client(self, client_id: str) -> Optional[Dict]:
        """Получение клиента по ID"""
        return self.clients.get(client_id)
    
    def get_client_by_name(self, name: str) -> Optional[Dict]:
        """Получение клиента по имени"""
        client_id = self.generate_client_id(name)
        return self.clients.get(client_id)
    
    def search_clients(self, query: str) -> List[Dict]:
        """Поиск клиентов"""
        query_lower = query.lower()
        results = []
        
        for client in self.clients.values():
            if (query_lower in client['name'].lower() or
                query_lower in client.get('phone', '').lower() or
                query_lower in client.get('email', '').lower()):
                results.append(client)
        
        return results
    
    def get_all_clients(self) -> List[Dict]:
        """Получение всех клиентов"""
        return list(self.clients.values())
    
    def delete_client(self, client_id: str) -> bool:
        """Удаление клиента"""
        if client_id in self.clients:
            del self.clients[client_id]
            self.save_clients()
            return True
        return False
