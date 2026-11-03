# Cloudflare runs linux/amd64 images. Node runs the TypeScript directly, so there is no build step.
FROM node:24-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY src/server.ts src/peaks.ts ./

ENV PORT=8080 NODE_ENV=production
EXPOSE 8080
USER node
CMD ["node", "server.ts"]
