FROM node:18-alpine3.15 

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Copy directory and content
COPY . ./usr/src/app
COPY package*.json tsconfig.json tsconfig.build.json /usr/src/app/
RUN npm install
# install nest globally
RUN npm install -g @nestjs/cli

# Clean cache
RUN npm cache clean --force

# Expose port
EXPOSE 3000

# Run the app
CMD [ "npm", "run", "start" ]
