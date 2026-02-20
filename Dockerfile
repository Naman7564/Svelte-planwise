# Stage 1: Build the SvelteKit app
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev tools for build)
RUN npm ci

# Copy application code
COPY . .

# Build the project
RUN npm run build

# Remove devDependencies from node_modules for a lighter production image
RUN npm prune --production

# Stage 2: Serve the app in production
FROM node:20-alpine

WORKDIR /app

# Copy the built output and production node_modules from the builder stage
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./

# Specify the port the SvelteKit node adapter will bind to
ENV PORT=3000
ENV NODE_ENV=production
EXPOSE 3000

# Start the Node.js server
CMD ["node", "build/index.js"]
