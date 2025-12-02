/**
 * BackgroundBlur Component
 * Figma 디자인의 배경 그라데이션 블러 효과를 재현
 */
export default function BackgroundBlur() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-orange-50 via-pink-50 to-yellow-50">
      {/* 오렌지 블러 */}
      <div
        className="absolute rounded-full opacity-40 blur-[500px]"
        style={{
          background: 'rgb(255, 68, 0)',
          width: '1064px',
          height: '1035px',
          top: '-483px',
          left: '310px',
        }}
      />

      {/* 노란색 블러 */}
      <div
        className="absolute rounded-full opacity-40 blur-[500px]"
        style={{
          background: 'rgb(255, 225, 0)',
          width: '700px',
          height: '700px',
          top: '574px',
          left: '453px',
        }}
      />

      {/* 오렌지-중간 블러 */}
      <div
        className="absolute rounded-full opacity-40 blur-[500px]"
        style={{
          background: 'rgb(255, 128, 0)',
          width: '807px',
          height: '807px',
          top: '287px',
          left: '-322px',
        }}
      />
    </div>
  );
}
