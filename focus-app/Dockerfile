FROM node:20-alpine 

# Set the working directory
WORKDIR /focus-app

# Copy package.json and install dependencies
COPY package*.json .
RUN npm install

# Copy the rest of the application
COPY . .

# Build the React app
RUN npm run build

# Expose the port
EXPOSE 5173

CMD ["npm", "run", "dev"]
