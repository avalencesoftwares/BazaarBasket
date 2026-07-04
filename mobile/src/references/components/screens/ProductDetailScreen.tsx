import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ChevronLeft, Minus, Plus, ShoppingCart } from 'lucide-react';
import { PRODUCTS } from '../../data/mockData';
import { useCart } from '../../context/CartContext';
import { ProductCard } from '../common/ProductCard';
import { EmptyState } from '../common/EmptyState';
import { Button } from '../ui/button';
export function ProductDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem, updateQty, getItemQty } = useCart();
  const product = PRODUCTS.find((p) => p.id === id);
  const qty = product ? getItemQty(product.id) : 0;
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return PRODUCTS.filter((p) => p.categoryId === product.categoryId && p.id !== product.id && p.inStock).slice(0, 6);
  }, [product]);
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
        <EmptyState title="Product not found" description="This product doesn't exist." actionLabel="Go Home" onAction={() => navigate('/home')} />
      </div>
    );
  }
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPct = hasDiscount ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100) : 0;
  return (
    <div className="min-h-screen bg-white max-w-md mx-auto pb-24">
      {/* Hero Image */}
      <div className="relative aspect-square bg-gray-50">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md"
        >
          <ChevronLeft size={22} className="text-gray-700" />
        </button>
        {hasDiscount && (
          <div className="absolute top-4 right-4 bg-[#22c55e] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
            {discountPct}% OFF
          </div>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="bg-gray-800 text-white text-sm font-semibold px-5 py-2.5 rounded-full">Currently Unavailable</span>
          </div>
        )}
      </div>
      {/* Product Info */}
      <div className="px-5 pt-5">
        <p className="text-xs text-gray-400 font-medium mb-1">{product.brand}</p>
        <h1 className="text-xl font-bold text-gray-900 mb-1">{product.name}</h1>
        <p className="text-sm text-gray-400 mb-3">{product.weight}</p>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-2xl font-bold text-gray-900">₹{product.price}</span>
          {hasDiscount && (
            <span className="text-base text-gray-400 line-through">₹{product.originalPrice}</span>
          )}
        </div>
        {/* Description */}
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-1.5">Description</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{product.description}</p>
        </div>
        {/* Quantity Selector */}
        {product.inStock && qty > 0 && (
          <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3 mb-5">
            <span className="text-sm font-medium text-gray-600">Quantity</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => updateQty(product.id, qty - 1)}
                className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <Minus size={16} className="text-gray-600" />
              </button>
              <span className="text-lg font-bold text-gray-900 min-w-[24px] text-center">{qty}</span>
              <button
                onClick={() => updateQty(product.id, qty + 1)}
                disabled={qty >= 10}
                className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-30"
              >
                <Plus size={16} className="text-gray-600" />
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="px-5 mt-2">
          <h3 className="text-base font-bold text-gray-900 mb-3">Related Products</h3>
          <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            {relatedProducts.map((p) => (
              <div key={p.id} className="flex-shrink-0 w-40">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Sticky Bottom Button */}
      {product.inStock && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-50">
          <div className="max-w-md mx-auto">
            {qty === 0 ? (
              <Button
                onClick={() => addItem(product)}
                className="w-full h-12 bg-[#22c55e] hover:bg-[#16a34a] text-white rounded-xl text-base font-semibold shadow-lg shadow-green-200"
              >
                <ShoppingCart size={18} />
                Add to Cart — ₹{product.price}
              </Button>
            ) : (
              <Button
                onClick={() => navigate('/cart')}
                className="w-full h-12 bg-[#16a34a] hover:bg-[#15803d] text-white rounded-xl text-base font-semibold shadow-lg shadow-green-200"
              >
                <ShoppingCart size={18} />
                Go to Cart — {qty} item{qty > 1 ? 's' : ''}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
