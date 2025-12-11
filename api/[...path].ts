import type { VercelRequest, VercelResponse } from '@vercel/node';

// 급식 API 프록시 - CORS 문제 해결을 위한 서버사이드 프록시
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS 헤더 설정 (모든 요청에 대해)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS 요청(CORS preflight) 처리
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // URL에서 직접 경로 추출 (더 안정적)
  const url = req.url || '';
  const apiPath = url.replace(/^\/api\/?/, ''); // /api/ 또는 /api 제거

  // 급식 API URL 구성
  const targetUrl = `https://api.xn--rh3b.net/${apiPath}`;

  console.log('[Proxy] 요청 받음:', {
    method: req.method,
    originalUrl: req.url,
    extractedPath: apiPath,
    targetUrl,
    query: req.query,
  });

  try {
    // 요청 메서드에 따라 처리
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log('[Proxy] 응답 받음:', {
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get('content-type'),
    });

    // 응답이 JSON이 아닐 수 있으므로 먼저 확인
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('[Proxy] JSON 데이터:', data);
      res.status(response.status).json(data);
    } else {
      const text = await response.text();
      console.log('[Proxy] 텍스트 응답:', text.substring(0, 200));
      res.status(response.status).send(text);
    }
  } catch (error) {
    console.error('[Proxy Error]', error);
    res.status(500).json({
      success: false,
      message: 'Proxy error occurred',
      error: error instanceof Error ? error.message : 'Unknown error',
      targetUrl,
    });
  }
}
