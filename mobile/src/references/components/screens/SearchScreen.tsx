import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Search as SearchIcon, Clock, X, TrendingUp } from 'lucide-react';
import { PRODUCTS, CATEGORIES } from '../../data/mockData';
import { ProductCard } from '../common/ProductCard';
import { EmptyState } from '../common/EmptyState';
import { useNavigate } from 'react-router';
const RECENT_KEY = 'bazaarbasket_recent_searches';
export function SearchScreen() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    } catch {
      return [];
    }
  });
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);
  const results = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    const q = debouncedQuery.toLowerCase();
    return PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.subcategory.toLowerCase().includes(q)
    );
  }, [debouncedQuery]);
  const saveSearch = useCallback((term: string) => {
    setRecentSearches((prev) => {
      const updated = [term, ...prev.filter((s) => s !== term)].slice(0, 8);
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);
  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_KEY);
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) saveSearch(query.trim());
  };
  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
      {/* Search Input */}
      <div className="sticky top-0 z-40 bg-white shadow-sm px-4 py-3">
        <form onSubmit={handleSubmit} className="relative">
          <SearchIcon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for products, brands..."
            className="w-full h-11 pl-10 pr-10 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#22c55e]/30 transition-all"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center"
            >
              <X size={12} className="text-white" />
            </button>
          )}
        </form>
      </div>
      <div className="p-4">
        {!debouncedQuery.trim() ? (
          /* Before typing: Recent + Popular */
          <>
            {recentSearches.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                    <Clock size={14} className="text-gray-400" />
                    Recent Searches
                  </h3>
                  <button onClick={clearRecent} className="text-xs text-gray-400 hover:text-red-400">
                    Clear
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:border-[#22c55e] hover:text-[#22c55e] transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                <TrendingUp size={14} className="text-[#22c55e]" />
                Popular Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.slice(0, 6).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => navigate(`/category/${cat.id}`)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-600 hover:border-[#22c55e] transition-colors"
                  >
                    <span>{cat.emoji}</span>
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : results.length > 0 ? (
          /* Results */
          <>
            <p className="text-xs text-gray-400 mb-3">{results.length} results for "{debouncedQuery}"</p>
            <div className="grid grid-cols-2 gap-3">
              {results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        ) : (
          /* No results */
          <EmptyState
            icon={SearchIcon}
            title="No results found"
            description={`We couldn't find anything for "${debouncedQuery}". Try a different search.`}
          />
        )}
      </div>
    </div>
  );
}
