FROM registry.cluster.local/node:16.13 AS builder
COPY . /app
WORKDIR /app
RUN npm config set registry http://10.1.1.33:8081/repository/npm-repo/ \
    && npm ci \
    && npm run build:nocheck

FROM registry.cluster.local/nginx:1.20-alpine
COPY --from=builder /app/dist /usr/share/nginx/html