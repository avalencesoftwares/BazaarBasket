// packages/admin/src/pages/Products.tsx
// Product management page: list products with pagination and filters, plus add/edit overlays

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Edit2,
  Trash2,
  ShoppingBag,
  Search,
  X,
  Loader2,
  PlusCircle,
  AlertTriangle,
  Check,
} from 'lucide-react';
import {
  getProducts,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../services/adminService';
import { formatCurrency } from '@bazaarbasket/shared';
import type { Product, ProductImage } from '@bazaarbasket/shared';

export const Products: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [includeInactive, setIncludeInactive] = useState(true);

  // Pagination cursor state
  const [pageCursor, setPageCursor] = useState<any>(null);
  const [cursorHistory, setCursorHistory] = useState<any[]>([]);

  // Add/Edit product overlay state
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states for Product create/edit
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priceRupees, setPriceRupees] = useState(''); // selling price in Rs
  const [mrpRupees, setMrpRupees] = useState('');     // mrp in Rs
  const [unit, setUnit] = useState('');               // e.g. "1kg"
  const [stock, setStock] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [gstSlab, setGstSlab] = useState<0 | 5 | 12 | 18>(0);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<{ file: File; preview: string }[]>([]);
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Query products list
  const { data: productData, isLoading: isProductsLoading } = useQuery({
    queryKey: ['products', selectedCategory, includeInactive, pageCursor],
    queryFn: () => getProducts({
      categoryId: selectedCategory || undefined,
      lastDoc: pageCursor || undefined,
      includeInactive,
    }),
  });

  // Query categories for filter & form dropdown
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const products = productData?.products || [];
  const hasMore = productData?.hasMore || false;

  // Soft delete product mutation
  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const handleOpenAddOverlay = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setCategoryId(categories[0]?.id || '');
    setPriceRupees('');
    setMrpRupees('');
    setUnit('1 kg');
    setStock(100);
    setIsActive(true);
    setGstSlab(0);
    setTagInput('');
    setTags([]);
    setImageFiles([]);
    setExistingImages([]);
    setImagesToRemove([]);
    setFormError(null);
    setIsOverlayOpen(true);
  };

  const handleOpenEditOverlay = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description || '');
    setCategoryId(product.categoryId);
    setPriceRupees(product.price.toString());
    setMrpRupees(product.mrp.toString());
    setUnit(product.unit);
    setStock(product.stock);
    setIsActive(product.isActive);
    setGstSlab(product.gstSlab);
    setTagInput('');
    setTags(product.tags || []);
    setImageFiles([]);
    setExistingImages(product.images || []);
    setImagesToRemove([]);
    setFormError(null);
    setIsOverlayOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newFiles = files.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setImageFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleRemoveNewImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (publicId: string) => {
    setImagesToRemove((prev) => [...prev, publicId]);
    setExistingImages((prev) => prev.filter((img) => img.publicId !== publicId));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags((prev) => [...prev, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64Data = result.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    // Basic Validation
    const price = parseFloat(priceRupees);
    const mrp = parseFloat(mrpRupees);

    if (isNaN(price) || price <= 0) {
      setFormError('Please enter a valid selling price.');
      setSaving(false);
      return;
    }
    if (isNaN(mrp) || mrp <= 0) {
      setFormError('Please enter a valid MRP price.');
      setSaving(false);
      return;
    }
    if (price > mrp) {
      setFormError('Selling price cannot be higher than Maximum Retail Price (MRP).');
      setSaving(false);
      return;
    }

    try {
      // Load all selected image files into base64
      const imageInputs = await Promise.all(
        imageFiles.map(async (img) => {
          const base64 = await fileToBase64(img.file);
          return {
            base64,
            mimeType: img.file.type,
            fileName: img.file.name,
          };
        })
      );

      if (editingProduct) {
        // Edit flow
        await updateProduct({
          productId: editingProduct.id,
          name,
          description,
          categoryId,
          price,
          mrp,
          unit,
          stock,
          imagesToAdd: imageInputs,
          imagesToRemove,
          isActive,
          tags,
          gstSlab,
        });
      } else {
        // Create flow
        await createProduct({
          name,
          description,
          categoryId,
          price,
          mrp,
          unit,
          stock,
          images: imageInputs,
          isActive,
          tags,
          gstSlab,
        });
      }

      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsOverlayOpen(false);
    } catch (err: any) {
      console.error(err);
      setFormError(err?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to deactivate/delete this product? It will be marked inactive and hidden from customers.')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err: any) {
        alert(err?.message || 'Failed to delete product');
      }
    }
  };

  const handleNextPage = () => {
    if (hasMore && productData?.lastDoc) {
      setCursorHistory((prev) => [...prev, pageCursor]);
      setPageCursor(productData.lastDoc);
    }
  };

  const handlePrevPage = () => {
    if (cursorHistory.length > 0) {
      const prevHistory = [...cursorHistory];
      const prevCursor = prevHistory.pop();
      setCursorHistory(prevHistory);
      setPageCursor(prevCursor);
    }
  };

  // Filter products locally by search query as search query on Firestore is complex
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase()) ||
    p.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-1">
            Manage your store items, prices, tax slabs, and stock levels.
          </p>
        </div>
        <button
          onClick={handleOpenAddOverlay}
          className="bg-primary hover:bg-primary/90 text-white font-semibold px-5 py-3 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all duration-150 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50/50 border border-border p-4 rounded-2xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-gray-50 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
          />
        </div>
        
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-gray-50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-muted-foreground focus:text-foreground transition-all duration-200"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 pl-2">
          <input
            type="checkbox"
            id="inactive-check"
            checked={includeInactive}
            onChange={(e) => setIncludeInactive(e.target.checked)}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary bg-gray-50"
          />
          <label htmlFor="inactive-check" className="text-sm font-medium text-muted-foreground cursor-pointer select-none">
            Include Inactive Products
          </label>
        </div>

        <div className="flex justify-end gap-2">
          {(search || selectedCategory || !includeInactive) && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('');
                setIncludeInactive(true);
              }}
              className="text-xs font-semibold hover:bg-secondary px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground transition-colors duration-150"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main product listings */}
      {isProductsLoading ? (
        <div className="glass-panel p-8 rounded-2xl flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
          <p className="text-sm text-muted-foreground animate-pulse">Loading product inventory catalog...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <ShoppingBag className="w-12 h-12 text-muted-foreground mb-4 animate-pulse" />
          <h3 className="text-lg font-bold text-foreground">No Products Found</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Try resetting your search filters or add a new product.
          </p>
          <button
            onClick={handleOpenAddOverlay}
            className="mt-6 bg-primary/20 text-primary hover:bg-primary hover:text-white font-semibold px-4 py-2.5 rounded-xl border border-primary/30 transition-all duration-200"
          >
            Create Product
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-gray-50">
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Product</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Price (MRP)</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Unit</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Stock</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">GST</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProducts.map((product) => {
                    const category = categories.find((c) => c.id === product.categoryId);
                    const hasDiscount = product.mrp > product.price;

                    return (
                      <tr key={product.id} className="hover:bg-gray-50/50 transition-colors duration-150">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={product.images[0].thumbnailUrl || product.images[0].url}
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded-lg border border-border bg-gray-50"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-secondary border border-border flex items-center justify-center text-muted-foreground">
                                <ShoppingBag className="w-5 h-5" />
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-foreground">{product.name}</p>
                              {product.tags && product.tags.length > 0 && (
                                <div className="flex gap-1 mt-1 flex-wrap">
                                  {product.tags.slice(0, 2).map((t, idx) => (
                                    <span key={idx} className="text-[10px] bg-secondary border border-border px-1.5 py-0.5 rounded text-muted-foreground">
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm font-medium text-muted-foreground">
                          {category ? category.name : 'Unknown'}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground">{formatCurrency(product.price)}</span>
                            {hasDiscount && (
                              <span className="text-xs text-muted-foreground line-through">
                                {formatCurrency(product.mrp)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-sm font-semibold">{product.unit}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                product.stock === 0
                                  ? 'bg-rose-500'
                                  : product.stock < 10
                                  ? 'bg-amber-500 animate-pulse'
                                  : 'bg-emerald-500'
                              }`}
                            />
                            <span className="text-sm font-semibold">
                              {product.stock === 0 ? 'Out of Stock' : `${product.stock} units`}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-xs font-mono">{product.gstSlab}%</td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              product.isActive
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-zinc-500/10 text-zinc-400'
                            }`}
                          >
                            {product.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditOverlay(product)}
                              className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors duration-150"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="p-2 rounded-lg hover:bg-destructive/15 text-destructive/80 hover:text-destructive transition-colors duration-150"
                              title="Delete/Deactivate"
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Simple Pagination Buttons */}
          <div className="flex items-center justify-between border-t border-border pt-4">
            <span className="text-xs text-muted-foreground">
              Showing page records
            </span>
            <div className="flex gap-2">
              <button
                onClick={handlePrevPage}
                disabled={cursorHistory.length === 0}
                className="px-4 py-2 border border-border rounded-xl text-sm font-medium hover:bg-secondary disabled:opacity-30 disabled:pointer-events-none transition-colors duration-200"
              >
                Previous
              </button>
              <button
                onClick={handleNextPage}
                disabled={!hasMore}
                className="px-4 py-2 border border-border rounded-xl text-sm font-medium hover:bg-secondary disabled:opacity-30 disabled:pointer-events-none transition-colors duration-200"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slide Drawer Overlay for Product Create & Edit */}
      {isOverlayOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-2xl h-screen overflow-y-auto p-6 md:p-8 flex flex-col justify-between border-l border-gray-100 animate-in slide-in-from-right duration-250">
            <div>
              {/* Overlay Header */}
              <div className="flex justify-between items-center pb-6 border-b border-border mb-6">
                <h2 className="text-2xl font-bold">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button
                  onClick={() => setIsOverlayOpen(false)}
                  className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors duration-150"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form content */}
              <form id="productForm" onSubmit={handleSubmit} className="space-y-6">
                {formError && (
                  <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    {formError}
                  </div>
                )}

                {/* Name */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground">Product Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-50 border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                    placeholder="e.g. Britannia Bourbon Chocolate Biscuits"
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full bg-gray-50 border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                    placeholder="Provide details about product ingredients, packaging, benefits..."
                  />
                </div>

                {/* Category & Unit */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-muted-foreground">Category</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full bg-gray-50 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                      required
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-muted-foreground">Unit Size / Weight</label>
                    <input
                      type="text"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full bg-gray-50 border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                      placeholder="e.g. 150g, 1L, 1 pc"
                      required
                    />
                  </div>
                </div>

                {/* Pricing & GST */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-muted-foreground">Selling Price (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={priceRupees}
                      onChange={(e) => setPriceRupees(e.target.value)}
                      className="w-full bg-gray-50 border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                      placeholder="99.00"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-muted-foreground">MRP Price (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={mrpRupees}
                      onChange={(e) => setMrpRupees(e.target.value)}
                      className="w-full bg-gray-50 border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                      placeholder="120.00"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-muted-foreground">GST Slab (%)</label>
                    <select
                      value={gstSlab}
                      onChange={(e) => setGstSlab(parseInt(e.target.value) as 0 | 5 | 12 | 18)}
                      className="w-full bg-gray-50 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                    >
                      <option value="0">0% (Exempt)</option>
                      <option value="5">5% (Essential)</option>
                      <option value="12">12% (Standard)</option>
                      <option value="18">18% (Standard Plus)</option>
                    </select>
                  </div>
                </div>

                {/* Stock & Active Switch */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-muted-foreground">Stock Quantity</label>
                    <input
                      type="number"
                      value={stock}
                      onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                      className="w-full bg-gray-50 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                      min="0"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50/50 border border-border self-end h-[50px]">
                    <span className="text-sm font-semibold">Active Status</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:height-5 after:width-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>

                {/* Tags Management */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground">Tags (For Search Indexing)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      className="flex-1 bg-gray-50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                      placeholder="Add tag, hit Enter"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="bg-secondary hover:bg-secondary/80 border border-border text-foreground px-4 rounded-xl text-sm font-medium transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex gap-1.5 flex-wrap mt-2">
                    {tags.map((tag, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 bg-primary/10 border border-primary/20 text-white px-2.5 py-1 rounded-full text-xs font-semibold">
                        {tag}
                        <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-destructive">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Image Uploads */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground block">Product Images</label>
                  <div className="grid grid-cols-5 gap-3">
                    {/* Existing Images */}
                    {existingImages.map((img) => (
                      <div key={img.publicId} className="relative aspect-square rounded-xl border border-border overflow-hidden bg-gray-50">
                        <img src={img.thumbnailUrl || img.url} alt="Product" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingImage(img.publicId)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-black/60 hover:bg-black text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    {/* New upload previews */}
                    {imageFiles.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl border border-border overflow-hidden bg-gray-50">
                        <img src={img.preview} alt="New Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveNewImage(idx)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-black/60 hover:bg-black text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    {/* Selector */}
                    {existingImages.length + imageFiles.length < 5 && (
                      <label className="aspect-square rounded-xl border border-dashed border-border hover:border-primary cursor-pointer flex flex-col items-center justify-center text-muted-foreground hover:text-primary bg-gray-50 hover:bg-primary/5 transition-all duration-200">
                        <PlusCircle className="w-6 h-6 mb-1" />
                        <span className="text-[10px] font-semibold uppercase">Add Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Upload up to 5 images. Supported format: JPEG, PNG, WEBP. Limit size to 5MB.
                  </p>
                </div>
              </form>

              {/* Action buttons footer */}
              <div className="flex justify-end gap-3 pt-6 border-t border-border mt-8">
                <button
                  type="button"
                  onClick={() => setIsOverlayOpen(false)}
                  className="px-5 py-3 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-secondary font-semibold transition-colors duration-150"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="productForm"
                  className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-all duration-150 flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving Product...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      {editingProduct ? 'Update Product' : 'Create Product'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
