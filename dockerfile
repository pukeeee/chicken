# Используем официальный Node.js образ
FROM node:20-alpine

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем все остальные файлы проекта
COPY . .

# Открываем порт (по умолчанию Nuxt слушает 3000)
EXPOSE 3000

# Запускаем Nuxt в режиме разработки
CMD ["npm", "run", "dev", "--", "--host"]