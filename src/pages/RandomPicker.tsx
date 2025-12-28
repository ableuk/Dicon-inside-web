import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import BackgroundBlur from '@/components/BackgroundBlur';
import type { RandomPickerConfig, RandomPickerResult, RandomPickerHistory } from '@/types';

const STORAGE_KEY = 'randomPickerHistory';

const RandomPicker = () => {
  const [pickCount, setPickCount] = useState<number>(5);
  const [minRange, setMinRange] = useState<number>(1);
  const [maxRange, setMaxRange] = useState<number>(30);
  const [excludedNumbers, setExcludedNumbers] = useState<number[]>([]);
  const [currentResult, setCurrentResult] = useState<RandomPickerResult | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

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
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const history: RandomPickerHistory = JSON.parse(saved);
        if (history.results.length > 0) {
          const latest = history.results[0];
          setCurrentResult({
            ...latest,
            generatedAt: new Date(latest.generatedAt),
          });
          setPickCount(latest.config.pickCount);
          setMinRange(latest.config.minRange);
          setMaxRange(latest.config.maxRange);
          setExcludedNumbers(latest.config.excludedNumbers || []);
        }
      } catch (error) {
        console.error('Failed to load random picker history:', error);
      }
    }
  }, []);

  // 제외 숫자 토글
  const toggleExcludedNumber = (num: number) => {
    setExcludedNumbers((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]
    );
  };

  // 범위가 변경되면 범위 밖의 제외 숫자 제거
  useEffect(() => {
    setExcludedNumbers((prev) =>
      prev.filter((num) => num >= minRange && num <= maxRange)
    );
  }, [minRange, maxRange]);

  // 입력 유효성 검사
  const validateConfig = (config: RandomPickerConfig): string | null => {
    if (config.pickCount < 1) return '뽑을 개수는 1 이상이어야 합니다';
    if (config.minRange >= config.maxRange) return '최소값은 최대값보다 작아야 합니다';
    const total = config.maxRange - config.minRange + 1;
    const excluded = config.excludedNumbers?.length || 0;
    const available = total - excluded;
    if (available <= 0) return '제외된 숫자가 너무 많습니다';
    if (config.pickCount > available)
      return `제외된 숫자를 제외하고 ${available}개까지만 뽑을 수 있습니다`;
    return null;
  };

  // 랜덤 숫자 생성 (중복 없음)
  const generateRandomNumbers = (config: RandomPickerConfig): number[] => {
    const { pickCount, minRange, maxRange, excludedNumbers = [] } = config;
    const available = Array.from(
      { length: maxRange - minRange + 1 },
      (_, i) => minRange + i
    ).filter((num) => !excludedNumbers.includes(num));
    const shuffled = shuffleArray(available);
    return shuffled.slice(0, pickCount).sort((a, b) => a - b);
  };

  // localStorage에 결과 저장
  const saveResult = (result: RandomPickerResult) => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const history: RandomPickerHistory = saved
        ? JSON.parse(saved)
        : { results: [], maxHistorySize: 10 };

      history.results.unshift(result);
      if (history.results.length > history.maxHistorySize) {
        history.results = history.results.slice(0, history.maxHistorySize);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save result:', error);
    }
  };

  // 랜덤 뽑기 실행
  const handleGenerate = () => {
    const config: RandomPickerConfig = {
      pickCount,
      minRange,
      maxRange,
      excludedNumbers: excludedNumbers.length > 0 ? excludedNumbers : undefined,
    };
    const error = validateConfig(config);

    if (error) {
      setValidationError(error);
      return;
    }

    setValidationError(null);

    const picks = generateRandomNumbers(config);
    const result: RandomPickerResult = {
      id: Date.now().toString(),
      config,
      picks,
      generatedAt: new Date(),
    };

    setCurrentResult(result);
    saveResult(result);
  };

  // 복사 기능
  const copyToClipboard = async () => {
    if (!currentResult) return;

    try {
      await navigator.clipboard.writeText(currentResult.picks.join(', '));
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('복사에 실패했습니다.');
    }
  };

  // 초기화
  const reset = () => {
    setCurrentResult(null);
    setValidationError(null);
    setExcludedNumbers([]);
  };

  // 시간 포맷팅
  const formatTime = (date: Date): string => {
    return new Date(date).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen relative">
      <BackgroundBlur />
      <Sidebar />
      <BottomNav />

      <main className="md:ml-[340px] p-4 md:p-6 min-h-screen pb-20 md:pb-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* 제목 */}
          <div className="text-center mb-4 md:mb-8">
            <h1 className="text-2xl md:text-4xl font-extrabold text-black mb-2">랜덤 뽑기</h1>
            <p className="text-sm md:text-base text-gray-600">번호를 랜덤으로 뽑아보세요</p>
          </div>

          {/* 설정 카드 */}
          <div className="bg-white/80 backdrop-blur-md border border-[#FFE1B6] rounded-2xl p-5 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold text-black mb-4 md:mb-6">뽑기 설정</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 뽑을 개수 입력 */}
              <div>
                <label className="block text-gray-700 mb-2 font-semibold">
                  뽑을 개수
                </label>
                <input
                  type="number"
                  min="1"
                  value={pickCount}
                  onChange={(e) => setPickCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-dicon-orange focus:outline-none bg-white"
                  placeholder="예: 5"
                />
              </div>

              {/* 최소값 입력 */}
              <div>
                <label className="block text-gray-700 mb-2 font-semibold">
                  최소값
                </label>
                <input
                  type="number"
                  value={minRange}
                  onChange={(e) => setMinRange(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-dicon-orange focus:outline-none bg-white"
                  placeholder="예: 1"
                />
              </div>

              {/* 최대값 입력 */}
              <div>
                <label className="block text-gray-700 mb-2 font-semibold">
                  최대값
                </label>
                <input
                  type="number"
                  value={maxRange}
                  onChange={(e) => setMaxRange(parseInt(e.target.value) || 30)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-dicon-orange focus:outline-none bg-white"
                  placeholder="예: 30"
                />
              </div>
            </div>

            {/* 제외할 숫자 선택 */}
            {maxRange - minRange + 1 <= 100 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-gray-700 font-semibold">
                    제외할 숫자 선택 (선택사항)
                  </label>
                  {excludedNumbers.length > 0 && (
                    <button
                      onClick={() => setExcludedNumbers([])}
                      className="text-sm text-red-500 hover:text-red-600 font-medium"
                    >
                      모두 해제
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-5 md:grid-cols-10 gap-2 max-h-60 overflow-y-auto p-3 bg-gray-50 rounded-lg">
                  {Array.from({ length: maxRange - minRange + 1 }, (_, i) => minRange + i).map(
                    (num) => (
                      <button
                        key={num}
                        onClick={() => toggleExcludedNumber(num)}
                        className={`
                          aspect-square rounded-lg font-semibold text-sm transition-all
                          ${
                            excludedNumbers.includes(num)
                              ? 'bg-red-500 text-white shadow-md'
                              : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-dicon-orange'
                          }
                        `}
                      >
                        {num}
                      </button>
                    )
                  )}
                </div>
                {excludedNumbers.length > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    제외된 숫자: {excludedNumbers.sort((a, b) => a - b).join(', ')}
                  </p>
                )}
              </div>
            )}

            {maxRange - minRange + 1 > 100 && (
              <div className="mt-6 p-3 bg-blue-50 border border-blue-300 rounded-lg">
                <p className="text-blue-700 text-sm">
                  범위가 너무 큽니다. 제외 기능은 범위가 100 이하일 때만 사용할 수 있습니다.
                </p>
              </div>
            )}

            {/* 유효성 검사 에러 메시지 */}
            {validationError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-300 rounded-lg">
                <p className="text-red-700 font-medium">{validationError}</p>
              </div>
            )}

            {/* 버튼들 */}
            <div className="mt-4 md:mt-6 flex flex-wrap gap-2 md:gap-3">
              <button
                onClick={handleGenerate}
                className="px-4 md:px-6 py-2 md:py-3 bg-dicon-orange hover:bg-dicon-orange/90 text-white text-sm md:text-base font-bold rounded-lg transition-colors"
              >
                랜덤 뽑기
              </button>

              {currentResult && (
                <button
                  onClick={reset}
                  className="px-4 md:px-6 py-2 md:py-3 bg-red-500 hover:bg-red-600 text-white text-sm md:text-base font-bold rounded-lg transition-colors"
                >
                  초기화
                </button>
              )}
            </div>
          </div>

          {/* 결과 카드 */}
          {currentResult && (
            <div className="bg-white/80 backdrop-blur-md border border-[#FFE1B6] rounded-2xl p-5 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-black mb-4 md:mb-6">뽑힌 번호</h2>

              {/* 숫자 그리드 */}
              <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3 md:gap-4 mb-6 md:mb-8">
                {currentResult.picks.map((num, idx) => (
                  <div
                    key={idx}
                    className="aspect-square bg-gradient-to-br from-dicon-orange to-dicon-accent rounded-xl flex items-center justify-center text-white text-xl md:text-2xl lg:text-3xl font-bold shadow-lg transform hover:scale-105 transition-transform"
                  >
                    {num}
                  </div>
                ))}
              </div>

              {/* 통계 정보 */}
              <div className="pt-4 md:pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-4 md:mb-6">
                  <div>
                    <p className="text-gray-500 text-xs md:text-sm mb-1">뽑은 개수</p>
                    <p className="text-black text-lg md:text-xl font-bold">{currentResult.picks.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs md:text-sm mb-1">범위</p>
                    <p className="text-black text-lg md:text-xl font-bold">
                      {currentResult.config.minRange} - {currentResult.config.maxRange}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs md:text-sm mb-1">전체 가능 개수</p>
                    <p className="text-black text-lg md:text-xl font-bold">
                      {currentResult.config.maxRange - currentResult.config.minRange + 1}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs md:text-sm mb-1">생성 시각</p>
                    <p className="text-black text-sm md:text-base font-bold">
                      {formatTime(currentResult.generatedAt)}
                    </p>
                  </div>
                </div>

                {/* 제외된 숫자 표시 */}
                {currentResult.config.excludedNumbers && currentResult.config.excludedNumbers.length > 0 && (
                  <div className="mb-4 md:mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-gray-700 mb-1 font-semibold">제외된 숫자:</p>
                    <p className="text-sm text-red-700">
                      {currentResult.config.excludedNumbers.sort((a, b) => a - b).join(', ')}
                    </p>
                  </div>
                )}

                {/* 액션 버튼들 */}
                <div className="flex flex-wrap gap-2 md:gap-3">
                  <button
                    onClick={copyToClipboard}
                    className="px-4 md:px-6 py-2 md:py-3 bg-purple-500 hover:bg-purple-600 text-white text-sm md:text-base font-bold rounded-lg transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-lg md:text-xl">content_copy</span>
                    {copySuccess ? '복사됨!' : '복사하기'}
                  </button>

                  <button
                    onClick={handleGenerate}
                    className="px-4 md:px-6 py-2 md:py-3 bg-dicon-accent hover:bg-dicon-accent/90 text-white text-sm md:text-base font-bold rounded-lg transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-lg md:text-xl">refresh</span>
                    다시 뽑기
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 빈 상태 */}
          {!currentResult && (
            <div className="bg-white/80 backdrop-blur-md border border-[#FFE1B6] rounded-2xl p-12 text-center">
              <div className="text-6xl mb-4">🎲</div>
              <p className="text-gray-600 text-lg">
                위에서 설정을 입력한 후 "랜덤 뽑기" 버튼을 눌러주세요
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default RandomPicker;
