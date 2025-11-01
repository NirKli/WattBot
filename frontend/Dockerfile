FROM node:25 AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY VERSION ../VERSION
RUN echo "VITE_APP_VERSION=$(cat ../VERSION)" > .env

COPY . .
RUN npm run build

FROM nginx:1.29

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
