# docker build -t sphinx-tribes-frontend .

FROM node:16 as build

# Create app directory
WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./
RUN yarn install --production

COPY . .

RUN yarn run build

FROM nginx:alpine
ARG REACT_APP_PUBLIC_POSTHOG_KEY
ARG REACT_APP_PUBLIC_POSTHOG_HOST

ENV REACT_APP_PUBLIC_POSTHOG_KEY=$REACT_APP_PUBLIC_POSTHOG_KEY
ENV REACT_APP_PUBLIC_POSTHOG_HOST=$REACT_APP_PUBLIC_POSTHOG_HOST

COPY --from=build /usr/src/app/deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /usr/src/app/build /usr/share/nginx/html
