FROM node:20

EXPOSE 3000

WORKDIR /home/node

USER root
RUN corepack enable && corepack prepare yarn@4.12.0 --activate

USER node
ENV YARN_NODE_LINKER=node-modules

# Copy root dependency metadata (from repo root context)
COPY --chown=node:node package.json yarn.lock /home/node/

# Copy workspace manifest for caching
COPY --chown=node:node projects/mybyte/package.json /home/node/projects/mybyte/package.json

RUN yarn install --immutable

# Copy workspace source
COPY --chown=node:node projects/mybyte /home/node/projects/mybyte

WORKDIR /home/node/projects/mybyte
RUN yarn build

CMD ["yarn", "start"]
