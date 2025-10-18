# Frontend Dockerfile для Railway

FROM node:18-alpine

WORKDIR /app

# Копируем package files
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь код
COPY . .

# Билдим приложение
RUN npm run build

# Порт из переменной окружения
ENV PORT=3000

# Запуск preview сервера
CMD npm run preview -- --host 0.0.0.0 --port $PORT
