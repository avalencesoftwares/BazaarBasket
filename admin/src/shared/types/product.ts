// packages/shared/src/types/product.ts
// Product-related type definitions for Firestore documents

export interface ProductImage {
  url: string;
  publicId: string;
  width: number;
  height: number;
  thumbnailUrl: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  price: number;
  mrp: number;
  unit: string;
  stock: number;
  images: ProductImage[];
  isActive: boolean;
  tags: string[];
  gstSlab: 0 | 5 | 12 | 18;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductInput {
  name: string;
  description: string;
  categoryId: string;
  price: number;
  mrp: number;
  unit: string;
  stock: number;
  images: Array<{
    base64: string;
    mimeType: string;
    fileName: string;
  }>;
  isActive: boolean;
  tags: string[];
  gstSlab: 0 | 5 | 12 | 18;
}

export interface UpdateProductInput {
  productId: string;
  name?: string;
  description?: string;
  categoryId?: string;
  price?: number;
  mrp?: number;
  unit?: string;
  stock?: number;
  imagesToAdd?: Array<{
    base64: string;
    mimeType: string;
    fileName: string;
  }>;
  imagesToRemove?: string[];
  isActive?: boolean;
  tags?: string[];
  gstSlab?: 0 | 5 | 12 | 18;
}
