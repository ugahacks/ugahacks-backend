FROM node:20

EXPOSE 3000

USER node
WORKDIR /home/node

# Pin Yarn 4
RUN corepack enable && corepack prepare yarn@4.12.0 --activate

# Ensure node_modules linker
ENV YARN_NODE_LINKER=node-modules

# 1) Copy monorepo dependency metadata (root)
COPY --chown=node:node package.json yarn.lock .yarnrc.yml /home/node/

# If you have a .yarn/ directory committed at repo root, copy it too
# (this is common with Yarn Berry). This line is safe only if .yarn exists.
COPY --chown=node:node .yarn /home/node/.yarn

# 2) Copy ONLY the workspace package.json first (better caching)
COPY --chown=node:node projects/mybyte/package.json /home/node/projects/mybyte/package.json

# Install deps for the whole workspace graph
RUN yarn install --immutable

# 3) Now copy the actual mybyte source
COPY --chown=node:node projects/mybyte /home/node/projects/mybyte

# Build mybyte specifically
WORKDIR /home/node/projects/mybyte
RUN yarn build

CMD ["yarn", "start"]
