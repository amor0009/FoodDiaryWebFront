# Этап 1: Сборка приложения
FROM node:18-alpine as builder

WORKDIR /app

# 1. Копируем только файлы, необходимые для установки зависимостей
COPY package.json package-lock.json ./

# 2. Устанавливаем ВСЕ зависимости (включая devDependencies)
RUN npm install && npm cache clean --force

# 3. Копируем остальные файлы проекта
COPY . .

# 4. Собираем приложение
RUN npm run build

# Этап 2: Сервинг приложения через Nginx
FROM nginx:1.23-alpine

# Копируем собранное приложение
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем наш конфиг Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]