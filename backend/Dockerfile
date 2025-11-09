FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY src ./src
RUN mkdir -p uploads

EXPOSE 3001

CMD ["npm", "start"]



