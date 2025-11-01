# ---- Base image ----
FROM node:20-slim

# Install system dependencies for Sharp + IPFS
RUN apt-get update && apt-get install -y \
  python3 make g++ libvips-dev curl wget ca-certificates tar bash \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

# Detect architecture and download the correct IPFS build
RUN ARCH=$(uname -m) && \
    if [ "$ARCH" = "aarch64" ]; then \
        echo "🏗 Installing ARM64 build of IPFS"; \
        wget -q https://dist.ipfs.tech/kubo/v0.29.0/kubo_v0.29.0_linux-arm64.tar.gz -O - | tar -xz; \
    else \
        echo "🏗 Installing AMD64 build of IPFS"; \
        wget -q https://dist.ipfs.tech/kubo/v0.29.0/kubo_v0.29.0_linux-amd64.tar.gz -O - | tar -xz; \
    fi && \
    cd kubo && bash install.sh && cd .. && rm -rf kubo*

# Create working directory
WORKDIR /usr/src/app

# Copy dependency files first for efficient caching
COPY package*.json yarn.lock ./

# Install dependencies, including Sharp (force rebuild if needed)
RUN yarn install --unsafe-perm 

# Copy the entire application
COPY . .

# Prepare directories
RUN mkdir -p uploads optimized

# Expose necessary ports
EXPOSE 8080 5001 4001

# Initialize IPFS
RUN ipfs init

# Start IPFS and then Node.js server
CMD ["bash", "-c", "\
  ipfs daemon --init & \
  echo '⏳ Waiting for IPFS to start...' && \
  until curl -s http://127.0.0.1:5001/api/v0/version > /dev/null; do sleep 1; done && \
  echo '✅ IPFS started!' && \
  node server.js \
"]
