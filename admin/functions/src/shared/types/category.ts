// packages/shared/src/types/category.ts
// Category-related type definitions for Firestore documents

export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  imagePublicId: string;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryInput {
  name: string;
  image?: {
    base64: string;
    mimeType: string;
    fileName: string;
  };
  sortOrder: number;
  isActive: boolean;
}

export interface UpdateCategoryInput {
  categoryId: string;
  name?: string;
  image?: {
    base64: string;
    mimeType: string;
    fileName: string;
  };
  removeImage?: boolean;
  sortOrder?: number;
  isActive?: boolean;
}
