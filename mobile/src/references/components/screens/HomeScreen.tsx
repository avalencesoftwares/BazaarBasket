import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { MapPin, ShoppingCart, Search, ChevronRight, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { CATEGORIES, PRODUCTS } from '../../data/mockData';
import { CategoryCarousel } from '../common/CategoryCarousel';
import { DeliverySlotBanner } from '../common/DeliverySlotBanner';
import { ProductCard } from '../common/ProductCard';
import { ShimmerCard } from '../common/ShimmerCard';
export function HomeScreen() {
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const [loading, setLoading] = useState(true);
  const dealProducts = PRODUCTS.filter((p) => p.originalPrice && p.inStock).slice(0, 8);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛒</span>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-tight">BazaarBasket</h1>
              <div className="flex items-center gap-1 text-[11px] text-gray-500">
                <MapPin size={10} className="text-[#22c55e]" />
                <span>Koramangala, 560034</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/cart')}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors relative"
          >
            <ShoppingCart size={22} className="text-gray-700" />
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 min-w-[18px] h-[18px] bg-[#22c55e] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </header>
      <div className="overflow-y-auto">
        {/* Search Bar */}
        <div className="px-4 py-3">
          <button
            onClick={() => navigate('/search')}
            className="w-full flex items-center gap-3 h-11 px-4 bg-gray-100 rounded-xl text-sm text-gray-400 hover:bg-gray-200 transition-colors"
          >
            <Search size={18} className="text-gray-400" />
            Search for atta, milk, fruits...
          </button>
        </div>
        {/* Delivery Slot Banner */}
        <div className="mb-4">
          <DeliverySlotBanner />
        </div>
        {/* Category Carousel */}
        <div className="mb-5">
          <div className="flex items-center justify-between px-4 mb-3">
            <h2 className="text-base font-bold text-gray-900">Shop by Category</h2>
          </div>
          <CategoryCarousel />
        </div>
        {/* Deals & Offers */}
        {loading ? (
          <div className="px-4 mb-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-[#22c55e]" />
              <h2 className="text-base font-bold text-gray-900">Deals & Offers</h2>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex-shrink-0 w-40">
                  <ShimmerCard />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="px-4 mb-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-[#22c55e]" />
              <h2 className="text-base font-bold text-gray-900">Deals & Offers</h2>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
              {dealProducts.map((product) => (
                <div key={product.id} className="flex-shrink-0 w-40">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Shop by Category Grid */}
        <div className="px-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-900">Browse All</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => navigate(`/category/${cat.id}`)}
                className="relative h-28 rounded-2xl overflow-hidden group shadow-sm"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white leading-tight">{cat.name}</span>
                    <ChevronRight size={14} className="text-white/60" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
        {/* Buy Again Placeholder */}
        <div className="px-4 mb-8">
          <div className="bg-gray-100 rounded-2xl p-6 text-center border-2 border-dashed border-gray-200">
            <span className="text-2xl mb-2 block">🔄</span>
            <h3 className="text-sm font-semibold text-gray-500">Buy Again</h3>
            <p className="text-xs text-gray-400 mt-1">Coming Soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}
