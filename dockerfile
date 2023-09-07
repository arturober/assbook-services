FROM node:current-alpine
WORKDIR /fullstackpro
COPY package*.json ./
RUN npm install 
COPY . .
RUN npm run build
RUN npm prune --production
CMD ["node", "dist/main"]