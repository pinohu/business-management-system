# Dockerfile for Node.js backend or full-stack app
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3000
CMD ["npm", "run", "dev"]
