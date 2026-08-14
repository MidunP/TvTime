FROM node:20-alpine

# tini handles zombie processes and passes signals to node correctly
RUN apk add --no-cache tini

# Run as non-root user for security
USER node

WORKDIR /app

# Copy manifests first (leverages Docker layer cache)
COPY --chown=node:node package*.json ./

# Install production deps only
RUN npm ci --omit=dev --ignore-scripts

# Copy app source
COPY --chown=node:node . .

# Expose API port
EXPOSE 5000

# Health check — Docker will mark container unhealthy if this fails
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:5000/health || exit 1

# Use tini as PID 1
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]
