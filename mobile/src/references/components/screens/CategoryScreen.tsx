import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router';
import { CATEGORIES, PRODUCTS } from '../../data/mockData';
import { AppHeader } from '../layout/AppHeader';
import { ProductCard } from '../common/ProductCard';
import { ShimmerCard } from '../common/ShimmerCard';
import { EmptyState } from '../common/EmptyState';
import { Search } from 'lucide-react';
export function CategoryScreen() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState('All');
  const category = CATEGORIES.find((c) => c.id === id);
  useEffect(() => {
    setLoading(true);
    setSelectedSub('All');
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [id]);
  const filteredProducts = useMemo(() => {
    if (!category) return [];
    let products = PRODUCTS.filter((p) => p.categoryId === category.id);
    if (selectedSub !== 'All') {
      products = products.filter((p) => p.subcategory === selectedSub);
    }
    return products;
  }, [category, selectedSub]);
  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
        <AppHeader title="Category" />
        <EmptyState title="Category not found" description="This category doesn't exist." />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
      <AppHeader title={category.name} rightAction="search" />
      {/* Subcategory Chips */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {category.subcategories.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSub(sub)}
              className={`
                flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all
                ${selectedSub === sub
                  ? 'bg-[#22c55e] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>
      {/* Product Grid */}
      <div className="p-4">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ShimmerCard key={i} />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Search}
            title="No products found"
            description={`No products in "${selectedSub}" yet.`}
          />
        )}
      </div>
    </div>
  );
}
