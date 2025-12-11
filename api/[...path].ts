import type { VercelRequest, VercelResponse } from '@vercel/node';

// 급식 API 프록시 - CORS 문제 해결을 위한 서버사이드 프록시
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // path 파라미터에서 실제 API 경로 추출
  const { path } = req.query;
  const apiPath = Array.isArray(path) ? path.join('/') : path || '';

  // 급식 API URL 구성
  const targetUrl = `https://api.xn--rh3b.net/${apiPath}`;

  try {
    // 요청 메서드에 따라 처리
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 응답 데이터 가져오기
    const data = await response.json();

    // CORS 헤더 설정
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 응답 반환
    res.status(response.status).json(data);
  } catch (error) {
    console.error('[Proxy Error]', error);
    res.status(500).json({
      success: false,
      message: 'Proxy error occurred',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
