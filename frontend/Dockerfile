FROM oven/bun:1.2.2

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /project
COPY package.json bun.lock ./
RUN bun install

ENTRYPOINT [ "bun", "run" ]
CMD [ "dev" ]
