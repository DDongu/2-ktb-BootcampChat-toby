/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: false,
  transpilePackages: ['@vapor-ui/core', '@vapor-ui/icons'],
  images: {
    unoptimized: true,
  },
  devIndicators: {
    buildActivity: true,
    buildActivityPosition: 'bottom-right',
  },
  // 디버그 모드 활성화
  ...(process.env.NODE_ENV === 'development' && {
    experimental: {
      forceSwcTransforms: true,
    },
    // 개발 환경에서 상세 로그 활성화
    onDemandEntries: {
      maxInactiveAge: 1000 * 60 * 60, // 1시간 동안 캐시 유지
      pagesBufferLength: 10,
    },
    logging: {
      level: 'debug', // dev 서버 로그 레벨
    },
  }),
};

module.exports = nextConfig;
