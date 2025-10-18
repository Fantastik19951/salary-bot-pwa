# Backend Dockerfile для Railway

FROM python:3.11-slim

WORKDIR /app

# Копируем requirements
COPY requirements.txt .

# Устанавливаем зависимости
RUN pip install --no-cache-dir -r requirements.txt

# Копируем весь код
COPY . .

# Порт из переменной окружения
ENV PORT=8000

# Запуск
CMD uvicorn main:app --host 0.0.0.0 --port $PORT
