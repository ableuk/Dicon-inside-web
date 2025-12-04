import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import BackgroundBlur from '@/components/BackgroundBlur';
import { fetchMealData } from '@/services/mealService';
import type { MealData } from '@/types/meal';

interface MealType {
  id: 'breakfast' | 'lunch' | 'dinner';
  label: string;
  icon: string;
  iconComponent: React.ReactElement;
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
        <span className="material-symbols-outlined text-[40px] text-[#FFB673]">wb_twilight</span>
      ),
    },
    {
      id: 'lunch',
      label: '점심',
      icon: 'wb_sunny',
      iconComponent: (
        <span className="material-symbols-outlined text-[40px] text-[#FFE100]">wb_sunny</span>
      ),
    },
    {
      id: 'dinner',
      label: '저녁',
      icon: 'bedtime',
      iconComponent: (
        <span className="material-symbols-outlined text-[40px] text-[#C4A56E]">bedtime</span>
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
      <BottomNav />

      {/* 메인 콘텐츠 */}
      <main className="md:ml-[340px] p-4 md:p-6 md:pr-6 h-screen flex flex-col pb-20 md:pb-6">
        <div className="w-full h-full flex flex-col gap-3">
          {/* 날짜 헤더 */}
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            {/* 날짜 표시 */}
            <div className="flex-1 bg-white/80 backdrop-blur-md border border-[#FFE1B6] rounded-[20px] px-4 py-4 md:px-6 md:py-8 text-center">
              <span className="text-xl md:text-4xl font-semibold text-black">
                {formatDateDisplay(selectedDate)}
              </span>
            </div>

            {/* 이전 버튼 */}
            <button
              onClick={() => changeDate(-1)}
              className="w-14 h-14 md:w-24 md:h-24 bg-white/80 backdrop-blur-md border border-[#FFE1B6] rounded-[20px] flex items-center justify-center hover:bg-white/90 transition-colors flex-shrink-0"
            >
              <span className="material-symbols-outlined text-[28px] md:text-[40px] text-black/50">chevron_left</span>
            </button>

            {/* 다음 버튼 */}
            <button
              onClick={() => changeDate(1)}
              className="w-14 h-14 md:w-24 md:h-24 bg-white/80 backdrop-blur-md border border-[#FFE1B6] rounded-[20px] flex items-center justify-center hover:bg-white/90 transition-colors flex-shrink-0"
            >
              <span className="material-symbols-outlined text-[28px] md:text-[40px] text-black/50">chevron_right</span>
            </button>
          </div>

          {/* 급식 카드 그리드 */}
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin h-16 w-16 border-4 border-dicon-orange border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-3 overflow-y-auto">
              {mealTypes.map((mealType) => {
                const items = mealData?.[mealType.id] || [];
                const hasItems = items.length > 0;

                return (
                  <div
                    key={mealType.id}
                    className="bg-white/80 backdrop-blur-md border border-[#FFE1B6]/50 rounded-[20px] md:rounded-[24px] overflow-hidden shadow-sm flex flex-col"
                  >
                    {/* 카드 헤더 */}
                    <div className="px-5 py-5 md:px-8 md:py-8">
                      <div className="flex items-center gap-2 md:gap-3">
                        <h3 className="text-[24px] md:text-[32px] font-bold text-black">
                          {mealType.label}
                        </h3>
                        <div className="scale-75 md:scale-100">
                          {mealType.iconComponent}
                        </div>
                      </div>
                    </div>

                    {/* 메뉴 리스트 */}
                    <div className="px-5 pb-5 md:px-8 md:pb-8 space-y-2 flex-1">
                      {hasItems ? (
                        items.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-2 md:gap-3 py-1 md:py-2"
                          >
                            <span className="text-black/60 mt-1 text-base md:text-lg">•</span>
                            <span className="text-base md:text-xl font-medium text-black flex-1 leading-relaxed">
                              {item}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="flex-1 flex items-center justify-center">
                          <p className="text-gray-500 text-base md:text-lg">급식 정보가 없습니다</p>
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
