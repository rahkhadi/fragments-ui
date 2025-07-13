# Stage 1: Build
FROM node:22-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Stage 2: Serve static files with Nginx
FROM nginx:alpine
COPY --from=build /app/src /usr/share/nginx/html
