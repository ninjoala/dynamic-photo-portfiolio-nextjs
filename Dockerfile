# Use the official Node.js image as the base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if it exists)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# If UPLOADTHING_TOKEN exists as an environment variable
ARG UPLOADTHING_TOKEN
ENV UPLOADTHING_TOKEN=${UPLOADTHING_TOKEN}

# Use the regular build command if token is provided, otherwise use production build
RUN if [ -n "$UPLOADTHING_TOKEN" ]; then \
      npm run build; \
    else \
      npm run build:production; \
    fi

# Expose the port that the Next.js app will run on
EXPOSE 3000

# Start the Next.js production server
CMD ["npm", "start"]