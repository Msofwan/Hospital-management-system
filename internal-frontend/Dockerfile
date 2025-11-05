FROM node:20-alpine AS builder

WORKDIR /app

ARG VITE_API_BASE_URL=http://localhost:8000
ARG VITE_APP_PORT=5173
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_APP_PORT=${VITE_APP_PORT}
ENV NODE_ENV=development

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build


FROM nginx:1.27-alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
