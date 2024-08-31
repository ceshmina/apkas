FROM node:20.16

WORKDIR /project
ENV NODE_ENV=development

COPY package.json yarn.lock ./
RUN yarn install
