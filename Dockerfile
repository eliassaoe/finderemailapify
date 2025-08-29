# Use official Apify SDK image
FROM apify/actor-node:18

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . ./

# Start the actor
CMD npm start
