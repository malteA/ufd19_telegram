FROM node:10-alpine as build
COPY . .
RUN npm install
RUN npm run build

FROM nginx:1.15-alpine
COPY --from=build /build ./usr/share/nginx/html

# Copy the default nginx.conf
COPY --from=build /nginx.conf /etc/nginx/conf.d/default.conf

# FROM node:10-alpine as release
# COPY --from=build /build ./build
# RUN npm install -g serve
# EXPOSE 5000
# CMD ["serve", "-s", "build"]