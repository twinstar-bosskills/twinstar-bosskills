# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=18.18
FROM node:${NODE_VERSION}-slim as base

LABEL fly_launch_runtime="NodeJS"

# NodeJS app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV=production


# Throw-away build stage to reduce size of final image
FROM base as build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install -y python-is-python3 pkg-config build-essential

# Install node modules
COPY --link package.json package-lock.json .
RUN npm install --include=dev

# Copy application code
COPY --link . .

# Build application
RUN npm run build

# volume for sqlite
RUN mkdir -p /data
VOLUME /data

# Final stage for app image
FROM base

RUN apt-get update -qq && \
    apt-get install -y htop curl nano ca-certificates fuse3 sqlite3

# Copy built application
COPY --from=build /app /app

# Start the server by default, this can be overwritten at runtime
CMD [ "npm", "run", "start" ]