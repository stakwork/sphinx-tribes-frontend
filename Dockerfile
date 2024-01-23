# docker build -t sphinx-tribes-frontend .

FROM node:16 as build

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./
RUN yarn install

COPY . .

RUN yarn run build

FROM nginx:alpine
COPY --from=build /usr/src/app/deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /usr/src/app/build /usr/share/nginx/html
