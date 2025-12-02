import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import BackgroundBlur from '@/components/BackgroundBlur';
import { fetchMealData } from '@/services/mealService';
import type { MealData } from '@/types/meal';

interface MealType {
  id: 'breakfast' | 'lunch' | 'dinner';
  label: string;
  icon: string;
  iconComponent: JSX.Element;
}

const Meals = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [mealData, setMealData] = useState<MealData | null>(null);
  const [loading, setLoading] = useState(false);

  const mealTypes: MealType[] = [
    {
      id: 'breakfast',
      label: '아침',
      icon: 'wb_twilight',
      iconComponent: (
        <span className="material-symbols-outlined text-[28px] text-[#FFB673]">wb_twilight</span>
      ),
    },
    {
      id: 'lunch',
      label: '점심',
      icon: 'wb_sunny',
      iconComponent: (
        <span className="material-symbols-outlined text-[28px] text-[#FFE100]">wb_sunny</span>
      ),
    },
    {
      id: 'dinner',
      label: '저녁',
      icon: 'bedtime',
      iconComponent: (
        <span className="material-symbols-outlined text-[28px] text-[#C4A56E]">bedtime</span>
      ),
    },
  ];

  // 날짜를 YYYYMMDD 형식으로 변환
  const formatDateToAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  };

  // 날짜를 표시용 형식으로 변환
  const formatDateDisplay = (date: Date): string => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const weekday = weekdays[date.getDay()];
    return `${month}월 ${day}일 ${weekday}`;
  };

  // 급식 데이터 로드
  const loadMealData = async (date: Date) => {
    setLoading(true);
    try {
      const dateStr = formatDateToAPI(date);
      const response = await fetchMealData(dateStr);
      if (response.success && response.data) {
        setMealData(response.data);
      } else {
        setMealData(null);
      }
    } catch (error) {
      console.error('급식 데이터 로드 실패:', error);
      setMealData(null);
    } finally {
      setLoading(false);
    }
  };

  // 날짜 변경
  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  // 초기 로드
  useEffect(() => {
    loadMealData(selectedDate);
  }, [selectedDate]);

  return (
    <div className="min-h-screen relative">
      <BackgroundBlur />
      <Sidebar />

      {/* 메인 콘텐츠 */}
      <main className="ml-[300px] p-6 min-h-screen">
        <div className="max-w-[1060px] mx-auto space-y-3">
          {/* 날짜 헤더 */}
          <div className="flex items-center gap-3">
            {/* 날짜 표시 */}
            <div className="flex-1 bg-white/80 backdrop-blur-md border border-[#FFE1B6] rounded-[20px] px-6 py-6 text-center">
              <span className="text-2xl font-semibold text-black">
                {formatDateDisplay(selectedDate)}
              </span>
            </div>

            {/* 이전 버튼 */}
            <button
              onClick={() => changeDate(-1)}
              className="w-20 h-20 bg-white/80 backdrop-blur-md border border-[#FFE1B6] rounded-[20px] flex items-center justify-center hover:bg-white/90 transition-colors"
            >
              <span className="material-symbols-outlined text-[32px] text-black/50">chevron_left</span>
            </button>

            {/* 다음 버튼 */}
            <button
              onClick={() => changeDate(1)}
              className="w-20 h-20 bg-white/80 backdrop-blur-md border border-[#FFE1B6] rounded-[20px] flex items-center justify-center hover:bg-white/90 transition-colors"
            >
              <span className="material-symbols-outlined text-[32px] text-black/50">chevron_right</span>
            </button>
          </div>

          {/* 급식 카드 그리드 */}
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="animate-spin h-12 w-12 border-4 border-dicon-orange border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              {mealTypes.map((mealType, mealIndex) => {
                const items = mealData?.[mealType.id] || [];
                const hasItems = items.length > 0;

                // 각 카드마다 다른 배경색 적용
                const cardBackgrounds = [
                  'bg-gradient-to-br from-[#FFE5CC]/90 to-[#FFEEDD]/90',
                  'bg-gradient-to-br from-[#FFF5CC]/90 to-[#FFFFDD]/90',
                  'bg-gradient-to-br from-[#FFF0DD]/90 to-[#FFF8EE]/90',
                ];

                return (
                  <div
                    key={mealType.id}
                    className={`${cardBackgrounds[mealIndex]} backdrop-blur-md border border-[#FFE1B6]/50 rounded-[24px] overflow-hidden shadow-sm`}
                  >
                    {/* 카드 헤더 */}
                    <div className="px-6 py-6">
                      <div className="flex items-center gap-2">
                        <h3 className="text-[24px] font-bold text-black">
                          {mealType.label}
                        </h3>
                        {mealType.iconComponent}
                      </div>
                    </div>

                    {/* 메뉴 리스트 */}
                    <div className="px-6 pb-6 space-y-1">
                      {hasItems ? (
                        items.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-2 py-1"
                          >
                            <span className="text-black/60 mt-1 text-sm">•</span>
                            <span className="text-base font-medium text-black flex-1 leading-relaxed">
                              {item}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="py-8 text-center">
                          <p className="text-gray-500 text-sm">급식 정보가 없습니다</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Meals;
