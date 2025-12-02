import { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import BackgroundBlur from '@/components/BackgroundBlur';

interface SeatingConfig {
  rows: number;
  cols: number;
  students: number;
  arrangement: (number | null)[];
}

const Seats = () => {
  const { isAdmin } = useAuth();
  const [rows, setRows] = useState<number>(5);
  const [cols, setCols] = useState<number>(6);
  const [students, setStudents] = useState<number>(30);
  const [arrangement, setArrangement] = useState<(number | null)[]>([]);
  const [isGenerated, setIsGenerated] = useState<boolean>(false);
  const seatingRef = useRef<HTMLDivElement>(null);

  // Fisher-Yates 알고리즘으로 배열 섞기
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // localStorage에서 데이터 불러오기
  useEffect(() => {
    const saved = localStorage.getItem('seatingConfig');
    if (saved) {
      try {
        const config: SeatingConfig = JSON.parse(saved);
        setRows(config.rows);
        setCols(config.cols);
        setStudents(config.students);
        setArrangement(config.arrangement);
        setIsGenerated(config.arrangement.length > 0);
      } catch (error) {
        console.error('Failed to load seating config:', error);
      }
    }
  }, []);

  // localStorage에 데이터 저장
  const saveToLocalStorage = (config: SeatingConfig) => {
    localStorage.setItem('seatingConfig', JSON.stringify(config));
  };

  // 랜덤 배치 생성
  const generateSeating = () => {
    const totalSeats = rows * cols;
    const studentNumbers = Array.from({ length: students }, (_, i) => i + 1);
    const shuffled = shuffleArray(studentNumbers);

    const newArrangement: (number | null)[] = [];
    for (let i = 0; i < totalSeats; i++) {
      newArrangement.push(i < students ? shuffled[i] : null);
    }

    setArrangement(newArrangement);
    setIsGenerated(true);

    const config: SeatingConfig = {
      rows,
      cols,
      students,
      arrangement: newArrangement,
    };
    saveToLocalStorage(config);
  };

  // 다시 섞기
  const reshuffle = () => {
    if (isGenerated) {
      generateSeating();
    }
  };

  // 초기화
  const reset = () => {
    setArrangement([]);
    setIsGenerated(false);
    localStorage.removeItem('seatingConfig');
  };

  // 이미지로 저장
  const saveAsImage = async () => {
    if (!seatingRef.current) return;

    try {
      const canvas = await html2canvas(seatingRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });

      const link = document.createElement('a');
      link.download = `자리배치표_${new Date().toLocaleDateString('ko-KR')}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Failed to save image:', error);
      alert('이미지 저장에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen relative">
      <BackgroundBlur />
      <Sidebar />

      <main className="ml-[300px] p-6 min-h-screen">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* 제목 */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-black mb-2">자리 배치</h1>
            <p className="text-gray-600">학생들의 자리를 랜덤으로 배치해보세요</p>
          </div>

          {/* 설정 카드 */}
          <div className="bg-white/80 backdrop-blur-md border border-[#FFE1B6] rounded-2xl p-8">
            {!isAdmin && (
              <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-4 mb-6">
                <p className="text-yellow-800 font-medium">
                  ⚠️ 자리 배치 변경은 관리자만 가능합니다.
                </p>
              </div>
            )}

            <h2 className="text-2xl font-bold text-black mb-6">배치 설정</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 행 수 입력 */}
              <div>
                <label className="block text-gray-700 mb-2 font-semibold">
                  행 수 (세로)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={rows}
                  onChange={(e) => setRows(Math.max(1, parseInt(e.target.value) || 1))}
                  disabled={!isAdmin}
                  className={`w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-dicon-orange focus:outline-none ${!isAdmin ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'bg-white'}`}
                  placeholder="예: 5"
                />
              </div>

              {/* 열 수 입력 */}
              <div>
                <label className="block text-gray-700 mb-2 font-semibold">
                  열 수 (가로)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={cols}
                  onChange={(e) => setCols(Math.max(1, parseInt(e.target.value) || 1))}
                  disabled={!isAdmin}
                  className={`w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-dicon-orange focus:outline-none ${!isAdmin ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'bg-white'}`}
                  placeholder="예: 6"
                />
              </div>

              {/* 학생 수 입력 */}
              <div>
                <label className="block text-gray-700 mb-2 font-semibold">
                  학생 수
                </label>
                <input
                  type="number"
                  min="1"
                  max={rows * cols}
                  value={students}
                  onChange={(e) => setStudents(Math.max(1, Math.min(rows * cols, parseInt(e.target.value) || 1)))}
                  disabled={!isAdmin}
                  className={`w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-dicon-orange focus:outline-none ${!isAdmin ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'bg-white'}`}
                  placeholder="예: 30"
                />
              </div>
            </div>

            {/* 버튼들 */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={generateSeating}
                disabled={!isAdmin}
                className={`px-6 py-3 bg-dicon-orange hover:bg-dicon-orange/90 text-white font-bold rounded-lg transition-colors ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isGenerated ? '새로 배치하기' : '랜덤 배치'}
              </button>

              {isGenerated && (
                <>
                  <button
                    onClick={reshuffle}
                    disabled={!isAdmin}
                    className={`px-6 py-3 bg-dicon-accent hover:bg-dicon-accent/90 text-white font-bold rounded-lg transition-colors ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    다시 섞기
                  </button>

                  <button
                    onClick={saveAsImage}
                    className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-lg transition-colors"
                  >
                    이미지로 저장
                  </button>

                  <button
                    onClick={reset}
                    disabled={!isAdmin}
                    className={`px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    초기화
                  </button>
                </>
              )}
            </div>
          </div>

          {/* 자리 배치 결과 */}
          {isGenerated && (
            <div className="bg-white/80 backdrop-blur-md border border-[#FFE1B6] rounded-2xl p-8">
              <div ref={seatingRef} className="bg-white rounded-lg p-8">
                {/* 교탁 */}
                <div className="mb-8">
                  <div className="bg-dicon-orange/10 border-2 border-dicon-orange rounded-lg p-4 text-center">
                    <p className="text-dicon-orange font-bold text-xl">교탁</p>
                  </div>
                </div>

                {/* 격자 */}
                <div
                  className="grid gap-4"
                  style={{
                    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                  }}
                >
                  {arrangement.map((student, index) => (
                    <div
                      key={index}
                      className={`
                        aspect-square rounded-lg flex items-center justify-center font-bold text-xl
                        transition-all duration-200
                        ${student !== null
                          ? 'bg-dicon-orange/20 border-2 border-dicon-orange text-black hover:bg-dicon-orange/30 hover:scale-105'
                          : 'bg-gray-100 border-2 border-gray-300 text-gray-400'
                        }
                      `}
                    >
                      {student !== null ? student : ''}
                    </div>
                  ))}
                </div>

                {/* 통계 정보 */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-gray-500 text-sm mb-1">전체 좌석</p>
                      <p className="text-black text-xl font-bold">{rows * cols}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm mb-1">학생 수</p>
                      <p className="text-black text-xl font-bold">{students}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm mb-1">빈 자리</p>
                      <p className="text-black text-xl font-bold">{rows * cols - students}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm mb-1">배치</p>
                      <p className="text-black text-xl font-bold">{rows} × {cols}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 안내 메시지 */}
          {!isGenerated && (
            <div className="bg-white/80 backdrop-blur-md border border-[#FFE1B6] rounded-2xl p-12 text-center">
              <div className="text-6xl mb-4">🎲</div>
              <p className="text-gray-600 text-lg">
                위에서 설정을 입력한 후 "랜덤 배치" 버튼을 눌러주세요
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Seats;
