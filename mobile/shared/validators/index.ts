// packages/shared/src/validators/index.ts
// Barrel export of all validators

export {
  createProductSchema,
  updateProductSchema,
  updateProductStockSchema,
  type CreateProductSchemaType,
  type UpdateProductSchemaType,
  type UpdateProductStockSchemaType,
} from './product.validator';

export {
  createCategorySchema,
  updateCategorySchema,
  type CreateCategorySchemaType,
  type UpdateCategorySchemaType,
} from './category.validator';

export {
  placeOrderSchema,
  updateOrderStatusSchema,
  cancelOrderSchema,
  type PlaceOrderSchemaType,
  type UpdateOrderStatusSchemaType,
  type CancelOrderSchemaType,
} from './order.validator';

export {
  addToCartSchema,
  updateCartQuantitySchema,
  removeFromCartSchema,
  type AddToCartSchemaType,
  type UpdateCartQuantitySchemaType,
  type RemoveFromCartSchemaType,
} from './cart.validator';

export {
  updateUserProfileSchema,
  addressSchema,
  type UpdateUserProfileSchemaType,
  type AddressSchemaType,
} from './user.validator';
