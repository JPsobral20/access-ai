# Use a base image that includes both Node.js and Python
FROM node:18

# Install Python (for running Python scripts)
RUN apt-get update && apt-get install -y python3 python3-pip python3-dev \
    && apt-get install -y build-essential libpq-dev

# Install PostgreSQL client (to interact with the database)
RUN apt-get install -y postgresql-client

# Install TypeScript globally
RUN npm install -g typescript

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the package.json and install Node.js dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your application code
COPY . .

# Compile TypeScript code (if necessary)
RUN npm run build

# List the contents of the dist directory to confirm that files were created
RUN ls -la dist

# Expose the port your Node.js app will run on
EXPOSE 3000

# Define environment variables (optional, useful for DB configuration)
ENV DB_HOST=postgres
ENV DB_USER=postgres
ENV DB_PASSWORD=mysecretpassword
ENV DB_NAME=mydb

# Start the Node.js application
CMD ["npm", "start"]
