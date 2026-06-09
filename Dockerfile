FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Build arguments
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_FRONTEND_URL

# Environment variables
ENV NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}
ENV NEXT_PUBLIC_FRONTEND_URL=${NEXT_PUBLIC_FRONTEND_URL}

# Copy application files
COPY . .

# Build application
RUN npm run build

# Expose application port
EXPOSE 3000

# Start application
CMD ["npm", "start"]