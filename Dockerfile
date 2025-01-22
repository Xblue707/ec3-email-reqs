FROM node:20-alpine AS runtime
WORKDIR /app

COPY . .
RUN yarn install
RUN yarn build
RUN yarn prisma migrate deploy
# Bind to all interfaces
ENV HOST=0.0.0.0
# Port to listen on
ENV PORT=4321
# Just convention, not required
EXPOSE 4321

CMD node ./dist/server/entry.mjs # Start the app
