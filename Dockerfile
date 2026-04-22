# ESTÁGIO 1: Instalação
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
# Copiamos o schema para gerar o client nas dependências
COPY prisma ./prisma/ 
RUN npm ci

# ESTÁGIO 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variáveis fakes para o build não tentar conectar no banco real
ENV NEXT_TELEMETRY_DISABLED 1
ENV DATABASE_URL="postgresql://johndoe:randompassword@localhost:5432/kidsapp"
ENV NEXTAUTH_SECRET="mrm54HMfOjDEDJ11l1O3K0LlBApR7nRrsWDgInPs4t8wUotH7O"

# PASSO CRUCIAL: Gerar o Prisma Client antes do build
RUN npx prisma generate
RUN npm run build

# ESTÁGIO 3: Execução (PRD)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copia os arquivos do standalone
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3008
ENV PORT 3008
ENV HOSTNAME "0.0.0.0"

# O standalone do Next.js gera um server.js que não precisa de mais nada
CMD ["node", "server.js"]