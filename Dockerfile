FROM node:16
WORKDIR /usr/src/app
COPY ./package.json ./package.json
COPY ./yarn.lock ./yarn.lock
RUN yarn --frozen-lockfile
COPY ./ ./
RUN yarn build

CMD ["node", "./dist/main.js"]
