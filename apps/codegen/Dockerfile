FROM node:18-slim
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --filter ./apps/codegen...
COPY apps/codegen ./apps/codegen
WORKDIR /app/apps/codegen
CMD ["node", "src/index.ts"]
