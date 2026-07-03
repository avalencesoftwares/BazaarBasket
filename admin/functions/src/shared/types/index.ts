// packages/shared/src/types/index.ts
// Barrel export of all type definitions

export type {
  Product,
  ProductImage,
  CreateProductInput,
  UpdateProductInput,
} from './product';

export type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from './category';

export type {
  Order,
  OrderItem,
  OrderAddress,
  OrderDeliverySlot,
  PlaceOrderInput,
  UpdateOrderStatusInput,
  CancelOrderInput,
} from './order';

export type {
  Cart,
  CartItem,
  AddToCartInput,
  UpdateCartQuantityInput,
  RemoveFromCartInput,
} from './cart';

export type {
  User,
  Address,
  UpdateUserProfileInput,
  DeliverySlot,
} from './user';

export type {
  StoreSettings,
  StoreSettingsDeliverySlot,
} from './storeSettings';
