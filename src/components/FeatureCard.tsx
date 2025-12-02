import { Link } from 'react-router-dom';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
  link: string;
  color: string;
}

const FeatureCard = ({ title, description, icon, link, color }: FeatureCardProps) => {
  return (
    <Link to={link} className="block group">
      <div className={`${color} rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 relative overflow-hidden backdrop-blur-sm bg-opacity-90`}>
        {/* 배경 그라데이션 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        {/* 콘텐츠 */}
        <div className="relative z-10">
          <div className="text-6xl mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
            {icon}
          </div>
          <h3 className="text-3xl font-bold text-white mb-3 group-hover:text-white/95 transition-colors">
            {title}
          </h3>
          <p className="text-white/80 text-lg group-hover:text-white/90 transition-colors">
            {description}
          </p>
        </div>

        {/* 하단 장식 라인 */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
      </div>
    </Link>
  );
};

export default FeatureCard;
