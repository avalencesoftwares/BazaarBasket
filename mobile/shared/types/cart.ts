// packages/shared/src/types/cart.ts
// Cart-related type definitions for Firestore documents

export interface CartItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  mrp: number;
  quantity: number;
  unit: string;
  stock: number;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  updatedAt: Date;
}

export interface AddToCartInput {
  productId: string;
  quantity: number;
}

export interface UpdateCartQuantityInput {
  productId: string;
  quantity: number;
}

export interface RemoveFromCartInput {
  productId: string;
}
