FROM node:12

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

WORKDIR /app/src
EXPOSE 3000
CMD [ "node", "server.js" ]