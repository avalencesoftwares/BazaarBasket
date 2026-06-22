// packages/admin/src/pages/Categories.tsx
// Category management page: list, add, edit, and delete categories

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Edit2,
  Trash2,
  FolderTree,
  X,
  Loader2,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../services/adminService';
import type { Category } from '@bazaarbasket/shared';

export const Categories: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  // Form states
  const [name, setName] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch categories query
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  // Delete category mutation
  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setName('');
    setSortOrder(categories.length > 0 ? Math.max(...categories.map(c => c.sortOrder)) + 10 : 10);
    setIsActive(true);
    setSelectedFile(null);
    setImagePreview(null);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setSortOrder(category.sortOrder);
    setIsActive(category.isActive);
    setSelectedFile(null);
    setImagePreview(category.imageUrl);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Limit file size (e.g. 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.');
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
    setSubmitting(true);
    setErrorMsg(null);

    try {
      let imageInput = undefined;
      
      // Convert selected file to base64 if present
      if (selectedFile) {
        const base64 = await fileToBase64(selectedFile);
        imageInput = {
          base64,
          mimeType: selectedFile.type,
          fileName: selectedFile.name,
        };
      }

      if (editingCategory) {
        // Update category flow
        await updateCategory({
          categoryId: editingCategory.id,
          name,
          sortOrder,
          isActive,
          image: imageInput,
        });
      } else {
        // Create category flow
        await createCategory({
          name,
          sortOrder,
          isActive,
          image: imageInput,
        });
      }

      // Refresh categories list
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsModalOpen(false);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (confirm('Are you sure you want to delete this category? All products under this category will remain, but their category association might be broken.')) {
      try {
        await deleteMutation.mutateAsync(categoryId);
      } catch (err: any) {
        alert(err?.message || 'Failed to delete category');
      }
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Categories</h1>
          <p className="text-muted-foreground mt-1">
            Organize products in inventory classification segments.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="bg-primary hover:bg-primary/90 text-white font-semibold px-5 py-3 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all duration-150 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Category
        </button>
      </div>

      {/* Main categories view */}
      {isLoading ? (
        <div className="glass-panel p-8 rounded-2xl flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
          <p className="text-sm text-muted-foreground">Loading categories list...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <FolderTree className="w-12 h-12 text-muted-foreground mb-4 animate-bounce" />
          <h3 className="text-lg font-bold text-foreground">No Categories Found</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Get started by creating your first product category.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="mt-6 bg-primary/20 text-primary hover:bg-primary hover:text-white font-semibold px-4 py-2.5 rounded-xl border border-primary/30 transition-all duration-200"
          >
            Create Category
          </button>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-gray-50">
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Image</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Slug</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sort Order</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50/50 transition-colors duration-150">
                    <td className="p-4">
                      {category.imageUrl ? (
                        <img
                          src={category.imageUrl}
                          alt={category.name}
                          className="w-12 h-12 object-cover rounded-lg border border-border bg-gray-50"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-secondary border border-border flex items-center justify-center text-muted-foreground">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-semibold text-foreground">{category.name}</td>
                    <td className="p-4 text-sm text-muted-foreground">{category.slug}</td>
                    <td className="p-4 font-mono text-sm">{category.sortOrder}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          category.isActive
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-zinc-500/10 text-zinc-400'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${category.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-400'}`} />
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(category)}
                          className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors duration-150"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="p-2 rounded-lg hover:bg-destructive/15 text-destructive/80 hover:text-destructive transition-colors duration-150"
                          title="Delete"
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Slide drawer / Dialog Modal for Category Create & Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h2 className="text-xl font-bold">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors duration-150"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {errorMsg && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                  {errorMsg}
                </div>
              )}

              {/* Name field */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground">Category Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50 border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  placeholder="e.g. Dairy & Eggs"
                  required
                />
              </div>

              {/* Sort Order */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground">Sort Order</label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                  className="w-full bg-gray-50 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  min="0"
                  required
                />
              </div>

              {/* Status Switch */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50/50 border border-border">
                <div>
                  <p className="text-sm font-semibold">Active Status</p>
                  <p className="text-xs text-muted-foreground">Inactive categories won&apos;t show in mobile search/lists</p>
                </div>
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

              {/* File Uploader */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground">Category Image</label>
                <div className="flex gap-4 items-center">
                  {imagePreview ? (
                    <div className="relative w-24 h-24 rounded-xl border border-border overflow-hidden bg-gray-50">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setImagePreview(null);
                        }}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/60 hover:bg-black text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-24 h-24 rounded-xl border border-dashed border-border hover:border-primary cursor-pointer flex flex-col items-center justify-center text-muted-foreground hover:text-primary bg-gray-50 hover:bg-primary/5 transition-all duration-200">
                      <ImageIcon className="w-6 h-6 mb-1" />
                      <span className="text-[10px] font-semibold uppercase">Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  )}
                  <div className="text-xs text-muted-foreground">
                    <p className="font-semibold">Recommended aspect ratio 1:1</p>
                    <p>Supported: JPEG, PNG, WEBP. Max 5MB.</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-secondary font-semibold transition-colors duration-150"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-all duration-150 flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      {editingCategory ? 'Save Changes' : 'Create Category'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
