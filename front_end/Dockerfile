# Create image based on the official Node 12 image from dockerhub
FROM node:12

# Change app directory
WORKDIR /app

# Copy dependency definitions
COPY package*.json ./
RUN npm install

# Get all the code needed to run the app
COPY . .

# Expose the port the app runs in
EXPOSE 4200

# Serve the app
CMD ["npm", "start"]