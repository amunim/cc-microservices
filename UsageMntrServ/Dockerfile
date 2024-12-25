FROM gcr.io/google-appengine/nodejs
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3002
CMD ["node", "index.js"] // Or the entry point for your app
