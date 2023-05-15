FROM node:16

# Create app directory
RUN mkdir -p /var/www/app
WORKDIR /var/www/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json /var/www/app/

RUN npm install --legacy-peer-deps
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 6007
CMD [ "npm", "run", "dev" ]
