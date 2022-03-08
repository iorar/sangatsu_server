FROM node:alpine

WORKDIR /usr/app

COPY ./server/ ./
RUN npm update
RUN npm install
# RUN npm run build
# RUN npx tsc --init

# CMD ["npm", "start"]
CMD [ "npx", "ts-node", "app.ts" ]