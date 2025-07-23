# 1. 베이스 이미지 설정
FROM node:18-alpine

# 2. 작업 디렉토리 설정
WORKDIR /usr/src/app

# 3. 의존성 설치
# package.json과 package-lock.json을 먼저 복사하여 의존성 캐싱 활용
COPY package*.json ./
RUN npm install --production

# 4. 소스 코드 복사
COPY . .

# 5. 애플리케이션 실행 포트 노출
EXPOSE 5000

# 6. 서버 시작 명령어
CMD ["node", "server.js"]