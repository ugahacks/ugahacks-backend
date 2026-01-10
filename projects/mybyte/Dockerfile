FROM node:20

EXPOSE 3000

USER node
WORKDIR /home/node

# Use Corepack to pin Yarn 4
RUN corepack enable && corepack prepare yarn@4.12.0 --activate

# Ensure Yarn uses node_modules (not PnP)
ENV YARN_NODE_LINKER=node-modules

# Copy dependency metadata first (important!)
COPY --chown=node:node package.json yarn.lock .yarnrc.yml /home/node/

RUN yarn cache clean
RUN rm -rf node_modules
RUN yarn install --immutable

# Copy the rest of the app
COPY --chown=node:node . /home/node

RUN yarn build

CMD ["yarn", "start"]
