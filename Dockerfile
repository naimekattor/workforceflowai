FROM node:20-slim

WORKDIR /app

ENV HOST=0.0.0.0
ENV PORT=3000

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000

CMD ["bash", "entrypoint.sh"]

