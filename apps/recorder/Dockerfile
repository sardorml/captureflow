# Cloudflare runs linux/amd64 images. The browser image matches the playwright version in package.json.
FROM mcr.microsoft.com/playwright:v1.64.1-noble

RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg fonts-noto-color-emoji \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
RUN npm init -y >/dev/null && npm install --omit=dev playwright@1.64.1
COPY dist/server.mjs ./server.mjs

ENV PORT=8080 NODE_ENV=production
EXPOSE 8080
USER pwuser
CMD ["node", "server.mjs"]
