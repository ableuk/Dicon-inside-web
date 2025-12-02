import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface WidgetCardProps {
  title: string;
  icon: string;
  children: ReactNode;
  link?: string;
  className?: string;
  headerColor?: string;
}

const WidgetCard = ({ title, icon, children, link, className = '', headerColor = 'bg-white' }: WidgetCardProps) => {
  const content = (
    <>
      {/* 헤더 */}
      <div className={`${headerColor} px-5 py-4 border-b border-gray-100`}>
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          {title}
        </h3>
      </div>

      {/* 콘텐츠 */}
      <div className="p-5">{children}</div>
    </>
  );

  if (link) {
    return (
      <Link
        to={link}
        className={`block bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100 ${className} cursor-pointer`}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100 ${className}`}>
      {content}
    </div>
  );
};

export default WidgetCard;
