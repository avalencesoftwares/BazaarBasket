// packages/admin/src/pages/Inventory.tsx
// Inventory management page: monitor stock levels, view low stock alerts, and perform quick inline stock updates

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Warehouse,
  Search,
  Plus,
  Minus,
  AlertTriangle,
  Check,
  Loader2,
  RefreshCw,
  TrendingDown,
} from 'lucide-react';
import { getProducts, updateProductStock, getCategories } from '../services/adminService';
import { LOW_STOCK_THRESHOLD } from '@bazaarbasket/shared';

export const Inventory: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'low' | 'out'>('all'); // all, low stock, out of stock
  
  // Stock adjustment inputs state: key is productId, value is adjustment amount (can be positive or negative)
  const [adjustments, setAdjustments] = useState<Record<string, number>>({});
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);

  // Fetch products query (with default pagesize 100 for better bulk oversight)
  const { data: productData, isLoading, refetch } = useQuery({
    queryKey: ['products-inventory'],
    queryFn: () => getProducts({ pageSize: 100, includeInactive: true }),
  });

  const products = productData?.products || [];

  // Fetch categories to show category names
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const handleAdjustChange = (productId: string, amount: number) => {
    setAdjustments((prev) => ({
      ...prev,
      [productId]: amount,
    }));
  };

  const handleIncrement = (productId: string, step = 5) => {
    setAdjustments((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + step,
    }));
  };

  const handleDecrement = (productId: string, currentStock: number, step = 5) => {
    const currentAdjust = adjustments[productId] || 0;
    // Prevent setting adjustments that make total stock negative
    if (currentStock + currentAdjust - step < 0) {
      setAdjustments((prev) => ({
        ...prev,
        [productId]: -currentStock,
      }));
    } else {
      setAdjustments((prev) => ({
        ...prev,
        [productId]: currentAdjust - step,
      }));
    }
  };

  const handleSaveStock = async (productId: string, currentStock: number) => {
    const delta = adjustments[productId] || 0;
    if (delta === 0) return;

    if (currentStock + delta < 0) {
      alert('Total stock cannot be negative.');
      return;
    }

    setLoadingProductId(productId);
    try {
      await updateProductStock({ productId, delta });
      // Reset this product's adjustment input
      setAdjustments((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
      // Invalidate queries to refresh lists
      queryClient.invalidateQueries({ queryKey: ['products-inventory'] });
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error(err);
      alert(err?.message || 'Failed to update stock');
    } finally {
      setLoadingProductId(null);
    }
  };

  // Filter items based on search and type selections
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterType === 'low') {
      return p.stock > 0 && p.stock < LOW_STOCK_THRESHOLD;
    }
    if (filterType === 'out') {
      return p.stock === 0;
    }
    return true;
  });

  // Calculate quick totals for page widgets
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock < LOW_STOCK_THRESHOLD).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground mt-1">
            Perform quick bulk stock updates and monitor low stock thresholds.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="bg-secondary hover:bg-secondary/80 border border-border text-foreground px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Stock
        </button>
      </div>

      {/* Inventory Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
          <div className="bg-primary/10 p-3.5 rounded-xl text-primary">
            <Warehouse className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-semibold uppercase">Total Tracked Items</span>
            <h3 className="text-2xl font-bold">{products.length}</h3>
          </div>
        </div>

        <div
          onClick={() => setFilterType('low')}
          className={`glass-panel p-5 rounded-2xl flex items-center gap-4 cursor-pointer hover:border-amber-500/40 transition-colors duration-200 ${
            filterType === 'low' ? 'border-amber-500 bg-amber-500/5' : ''
          }`}
        >
          <div className="bg-amber-500/10 p-3.5 rounded-xl text-amber-400">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-semibold uppercase">Low Stock Warning</span>
            <h3 className="text-2xl font-bold text-amber-400">{lowStockCount}</h3>
          </div>
        </div>

        <div
          onClick={() => setFilterType('out')}
          className={`glass-panel p-5 rounded-2xl flex items-center gap-4 cursor-pointer hover:border-rose-500/40 transition-colors duration-200 ${
            filterType === 'out' ? 'border-rose-500 bg-rose-500/5' : ''
          }`}
        >
          <div className="bg-rose-500/10 p-3.5 rounded-xl text-rose-400">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-semibold uppercase">Out of Stock</span>
            <h3 className="text-2xl font-bold text-rose-400">{outOfStockCount}</h3>
          </div>
        </div>
      </div>

      {/* Filters bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50/50 border border-gray-150 p-4 rounded-2xl">
        <div className="relative col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items by name or tags..."
            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 shadow-sm"
          />
        </div>

        <div className="flex gap-1.5 justify-end">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${
              filterType === 'all'
                ? 'bg-primary border-primary text-primary-foreground shadow-sm'
                : 'bg-gray-100 border-transparent text-muted-foreground hover:bg-gray-200/50 hover:text-foreground'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('low')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${
              filterType === 'low'
                ? 'bg-amber-500 border-amber-500 text-black shadow-sm'
                : 'bg-gray-100 border-transparent text-muted-foreground hover:bg-gray-200/50 hover:text-foreground'
            }`}
          >
            Low Stock
          </button>
          <button
            onClick={() => setFilterType('out')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${
              filterType === 'out'
                ? 'bg-rose-500 border-rose-500 text-white shadow-sm'
                : 'bg-gray-100 border-transparent text-muted-foreground hover:bg-gray-200/50 hover:text-foreground'
            }`}
          >
            Out of Stock
          </button>
        </div>
      </div>

      {/* Products table */}
      {isLoading ? (
        <div className="glass-panel p-8 rounded-2xl flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
          <p className="text-sm text-muted-foreground animate-pulse">Loading stock records...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <Warehouse className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-bold text-foreground">No Items Found</h3>
          <p className="text-sm text-muted-foreground mt-2">
            No products match the selected search or inventory filter criteria.
          </p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-gray-50/75">
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Product</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current Stock</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center">Quick Adjust</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProducts.map((product) => {
                  const category = categories.find((c) => c.id === product.categoryId);
                  const delta = adjustments[product.id] || 0;
                  const finalStock = product.stock + delta;
                  const isDeltaActive = delta !== 0;

                  return (
                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors duration-150">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0].thumbnailUrl || product.images[0].url}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-lg border border-gray-100 bg-gray-100"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-secondary border border-border flex items-center justify-center text-muted-foreground">
                              <Warehouse className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-foreground">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{product.unit}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm font-medium text-muted-foreground">
                        {category ? category.name : 'Unknown'}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-mono font-bold text-base">
                            {product.stock} units
                          </span>
                          {isDeltaActive && (
                          <span className={`text-xs font-semibold flex items-center gap-1 ${delta > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {delta > 0 ? '+' : ''}{delta} → {finalStock} units
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        {product.stock === 0 ? (
                          <span className="bg-rose-50 text-rose-700 border border-rose-200/60 px-2 py-0.5 rounded text-xs font-bold">
                            Out of Stock
                          </span>
                        ) : product.stock < LOW_STOCK_THRESHOLD ? (
                          <span className="bg-amber-50 text-amber-700 border border-amber-200/60 px-2 py-0.5 rounded text-xs font-bold animate-pulse">
                            Low Stock
                          </span>
                        ) : (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 rounded text-xs font-bold">
                            Healthy
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleDecrement(product.id, product.stock, 5)}
                            className="p-2 border border-gray-200 bg-white hover:bg-gray-50 rounded-xl transition-colors duration-150"
                            title="Subtract 5"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="number"
                            value={delta || ''}
                            onChange={(e) => handleAdjustChange(product.id, parseInt(e.target.value) || 0)}
                            placeholder="± Amount"
                            className="bg-white border border-gray-200 rounded-xl text-center w-20 py-1.5 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                          <button
                            onClick={() => handleIncrement(product.id, 5)}
                            className="p-2 border border-gray-200 bg-white hover:bg-gray-50 rounded-xl transition-colors duration-150"
                            title="Add 5"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleSaveStock(product.id, product.stock)}
                          disabled={!isDeltaActive || loadingProductId === product.id}
                          className="bg-primary disabled:bg-secondary disabled:text-muted-foreground text-primary-foreground font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1 shadow-sm active:scale-[0.98] disabled:scale-100 disabled:opacity-40 transition-all duration-150 inline-flex"
                        >
                          {loadingProductId === product.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                          Save
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
