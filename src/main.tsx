import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// 개발 환경에서 캐시 클리어 유틸리티 로드
if (import.meta.env.DEV) {
  import('./utils/clearCache');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
