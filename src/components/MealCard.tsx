import { useState } from 'react';
import type { MealType } from '@/types/meal';
import { searchFoodImage } from '@/services/mealService';

interface MealCardProps {
  type: MealType;
  label: string;
  emoji: string;
  items: string[] | undefined;
}

const MealCard = ({ label, emoji, items }: MealCardProps) => {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(false);

  const handleFoodClick = async (foodName: string) => {
    if (expandedItem === foodName) {
      setExpandedItem(null);
      setImageUrl(null);
      return;
    }

    setExpandedItem(foodName);
    setLoadingImage(true);
    setImageUrl(null);

    try {
      const result = await searchFoodImage(foodName);
      if (result?.imageUrl) {
        setImageUrl(result.imageUrl);
      }
    } catch (error) {
      console.error('Failed to load food image:', error);
    } finally {
      setLoadingImage(false);
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{emoji}</span>
          <h3 className="text-xl font-bold text-white">{label}</h3>
        </div>
        <p className="text-white/40 text-sm">급식 정보가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10 hover:border-white/20 transition-all">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{emoji}</span>
        <h3 className="text-xl font-bold text-white">{label}</h3>
      </div>

      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="group">
            <button
              onClick={() => handleFoodClick(item)}
              className="w-full text-left text-white/90 hover:text-white hover:bg-white/5 rounded px-3 py-2 transition-all"
            >
              <span className="inline-block mr-2 text-green-400">•</span>
              {item}
            </button>

            {expandedItem === item && (
              <div className="mt-2 ml-5 p-3 bg-white/5 rounded-lg border border-white/10">
                {loadingImage && (
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white/80 rounded-full"></div>
                    <span>이미지 검색 중...</span>
                  </div>
                )}
                {!loadingImage && imageUrl && (
                  <img
                    src={imageUrl}
                    alt={item}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}
                {!loadingImage && !imageUrl && (
                  <p className="text-white/40 text-sm">이미지를 찾을 수 없습니다.</p>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MealCard;
