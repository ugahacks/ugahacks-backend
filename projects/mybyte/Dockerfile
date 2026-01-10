FROM node:20

EXPOSE 3000

USER node
WORKDIR /home/node

# Pin Yarn 4
RUN corepack enable && corepack prepare yarn@4.12.0 --activate

# Ensure node_modules linker
ENV YARN_NODE_LINKER=node-modules

# Copy root dependency metadata
COPY --chown=node:node package.json yarn.lock /home/node/
COPY --chown=node:node .yarnrc.yml /home/node/

# Copy workspace manifest early for caching
COPY --chown=node:node projects/mybyte/package.json /home/node/projects/mybyte/package.json

# Install deps for the monorepo graph
RUN yarn install --immutable

# Copy mybyte source
COPY --chown=node:node projects/mybyte /home/node/projects/mybyte

WORKDIR /home/node/projects/mybyte
RUN yarn build

CMD ["yarn", "start"]
