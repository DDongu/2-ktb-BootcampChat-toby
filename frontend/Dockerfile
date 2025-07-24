# 1. 빌드 단계 (Builder Stage)
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# 의존성 설치
COPY package*.json ./
RUN npm install

# 소스 코드 복사 및 빌드
COPY . .
# NEXT_PUBLIC_API_URL을 빌드 시점에 전달할 수 있도록 ARG로 선언
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_ENCRYPTION_KEY
ARG NEXT_PUBLIC_PASSWORD_SALT
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_ENCRYPTION_KEY=${NEXT_PUBLIC_ENCRYPTION_KEY}
ENV NEXT_PUBLIC_PASSWORD_SALT=${NEXT_PUBLIC_PASSWORD_SALT}
RUN npm run build

# 2. 프로덕션 단계 (Production Stage)
FROM node:18-alpine

WORKDIR /usr/src/app

# 빌드 단계에서 생성된 파일들만 복사
COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/node_modules ./node_modules

# 애플리케이션 실행 포트 노출
EXPOSE 3000

# 서버 시작 명령어
CMD ["npm", "start"]