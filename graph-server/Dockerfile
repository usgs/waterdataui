# Build the static assets in the node.js container.
FROM wdfn_assets as assets
RUN npm run build

# Use LTS release
FROM node:10.15-alpine

# Installs latest Chromium package.
RUN apk update && apk upgrade && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories && \
    apk add --no-cache \
        chromium@edge \
        harfbuzz@edge \
        nss@edge

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    CHROME_BIN=/usr/bin/chromium-browser \
    CHROME_PATH=/usr/lib/chromium/

# Source will be added here
WORKDIR /graph-server

# Add manifest and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Add the server source code
COPY ./src ./src

# Copy static files from the assets image to this one
COPY --from=assets /assets/dist /assets

# Add user so we don't need the --no-sandbox Chrome option
RUN addgroup -S grapher && adduser -S -g grapher grapher \
    && mkdir -p /home/grapher/Downloads \
    && chown -R grapher:grapher /home/grapher \
    && chown -R grapher:grapher /graph-server
USER grapher

EXPOSE 2929

CMD npm start
