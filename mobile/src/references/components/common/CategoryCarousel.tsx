import { useNavigate } from 'react-router';
import { CATEGORIES } from '../../data/mockData';
export function CategoryCarousel() {
  const navigate = useNavigate();
  return (
    <div className="px-4">
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => navigate(`/category/${cat.id}`)}
            className="flex flex-col items-center gap-2 flex-shrink-0 group"
            style={{ minWidth: 68 }}
          >
            <div className={`w-16 h-16 rounded-2xl ${cat.color} flex items-center justify-center text-2xl shadow-sm group-hover:shadow-md transition-shadow group-hover:scale-105 transition-transform`}>
              {cat.emoji}
            </div>
            <span className="text-[11px] font-medium text-gray-600 text-center leading-tight w-16 line-clamp-2">
              {cat.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}