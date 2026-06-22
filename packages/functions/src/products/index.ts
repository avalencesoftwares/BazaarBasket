// packages/functions/src/products/index.ts
// Product management Cloud Functions (Admin-only)

import { onCall } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import {
  COLLECTIONS,
  CLOUDINARY_FOLDERS,
  createProductSchema,
  updateProductSchema,
  updateProductStockSchema,
  sanitizeObject,
  generateSlug,
} from '@bazaarbasket/shared';
import type { Product, ProductImage } from '@bazaarbasket/shared';
import { requireAdmin } from '../middleware/auth';
import { checkRateLimit } from '../middleware/rateLimiter';
import { validateInput } from '../middleware/validator';
import { uploadImage, deleteImage } from '../utils/cloudinary';
import { logger } from '../utils/logger';

const REGION = 'asia-south1';

export const createProduct = onCall(
  { region: REGION, maxInstances: 10, memory: '512MiB' },
  async (request) => {
    const adminUid = requireAdmin(request);
    await checkRateLimit(adminUid);

    const input = validateInput(createProductSchema, request.data);
    const sanitized = sanitizeObject(input as unknown as Record<string, unknown>);
    const db = getFirestore();

    // Upload images to Cloudinary
    const images: ProductImage[] = [];
    for (const img of input.images || []) {
      const result = await uploadImage(
        img.base64,
        CLOUDINARY_FOLDERS.PRODUCT_IMAGES,
        `${Date.now()}_${img.fileName}`,
      );
      images.push(result);
    }

    const slug = generateSlug(sanitized.name as string);
    const now = new Date();

    const productData: Omit<Product, 'id'> = {
      name: sanitized.name as string,
      slug,
      description: (sanitized.description as string) || '',
      categoryId: sanitized.categoryId as string,
      price: input.price,
      mrp: input.mrp,
      unit: sanitized.unit as string,
      stock: input.stock,
      images,
      isActive: input.isActive ?? true,
      tags: input.tags ?? [],
      gstSlab: input.gstSlab,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await db.collection(COLLECTIONS.PRODUCTS).add(productData);

    // Update category product count
    await db
      .collection(COLLECTIONS.CATEGORIES)
      .doc(input.categoryId)
      .update({ productCount: FieldValue.increment(1) });

    logger.info('Product created', {
      userId: adminUid,
      action: 'createProduct',
      productId: docRef.id,
    });

    return { productId: docRef.id };
  },
);

export const updateProduct = onCall(
  { region: REGION, maxInstances: 10, memory: '512MiB' },
  async (request) => {
    const adminUid = requireAdmin(request);
    await checkRateLimit(adminUid);

    const input = validateInput(updateProductSchema, request.data);
    const db = getFirestore();

    const productRef = db.collection(COLLECTIONS.PRODUCTS).doc(input.productId);
    const productSnap = await productRef.get();

    if (!productSnap.exists) {
      throw new (await import('firebase-functions/v2/https')).HttpsError(
        'not-found',
        'Product not found',
      );
    }

    const existingProduct = productSnap.data() as Product;
    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    // Handle text field updates
    if (input.name !== undefined) {
      const sanitized = sanitizeObject({ name: input.name });
      updateData.name = sanitized.name;
      updateData.slug = generateSlug(sanitized.name);
    }
    if (input.description !== undefined) {
      updateData.description = sanitizeObject({ description: input.description }).description;
    }
    if (input.categoryId !== undefined) {
      // Update old and new category product counts
      if (input.categoryId !== existingProduct.categoryId) {
        await db
          .collection(COLLECTIONS.CATEGORIES)
          .doc(existingProduct.categoryId)
          .update({ productCount: FieldValue.increment(-1) });
        await db
          .collection(COLLECTIONS.CATEGORIES)
          .doc(input.categoryId)
          .update({ productCount: FieldValue.increment(1) });
      }
      updateData.categoryId = input.categoryId;
    }
    if (input.price !== undefined) { updateData.price = input.price; }
    if (input.mrp !== undefined) { updateData.mrp = input.mrp; }
    if (input.unit !== undefined) { updateData.unit = input.unit; }
    if (input.stock !== undefined) { updateData.stock = input.stock; }
    if (input.isActive !== undefined) { updateData.isActive = input.isActive; }
    if (input.tags !== undefined) { updateData.tags = input.tags; }
    if (input.gstSlab !== undefined) { updateData.gstSlab = input.gstSlab; }

    // Handle image removals
    if (input.imagesToRemove && input.imagesToRemove.length > 0) {
      for (const publicId of input.imagesToRemove) {
        await deleteImage(publicId);
      }
      const remainingImages = existingProduct.images.filter(
        (img) => !input.imagesToRemove?.includes(img.publicId),
      );
      updateData.images = remainingImages;
    }

    // Handle image additions
    if (input.imagesToAdd && input.imagesToAdd.length > 0) {
      const currentImages = (updateData.images as ProductImage[]) || existingProduct.images;
      for (const img of input.imagesToAdd) {
        const result = await uploadImage(
          img.base64,
          CLOUDINARY_FOLDERS.PRODUCT_IMAGES,
          `${Date.now()}_${img.fileName}`,
        );
        currentImages.push(result);
      }
      updateData.images = currentImages;
    }

    await productRef.update(updateData);

    logger.info('Product updated', {
      userId: adminUid,
      action: 'updateProduct',
      productId: input.productId,
    });
  },
);

export const deleteProduct = onCall(
  { region: REGION, maxInstances: 10 },
  async (request) => {
    const adminUid = requireAdmin(request);
    await checkRateLimit(adminUid);

    const { productId } = request.data as { productId: string };
    if (!productId) {
      throw new (await import('firebase-functions/v2/https')).HttpsError(
        'invalid-argument',
        'Product ID is required',
      );
    }

    const db = getFirestore();
    const productRef = db.collection(COLLECTIONS.PRODUCTS).doc(productId);
    const productSnap = await productRef.get();

    if (!productSnap.exists) {
      throw new (await import('firebase-functions/v2/https')).HttpsError(
        'not-found',
        'Product not found',
      );
    }

    const product = productSnap.data() as Product;

    // Delete images from Cloudinary
    for (const img of product.images) {
      await deleteImage(img.publicId);
    }

    // Soft delete — set isActive to false
    await productRef.update({ isActive: false, updatedAt: new Date() });

    // Update category product count
    await db
      .collection(COLLECTIONS.CATEGORIES)
      .doc(product.categoryId)
      .update({ productCount: FieldValue.increment(-1) });

    logger.info('Product deleted (soft)', {
      userId: adminUid,
      action: 'deleteProduct',
      productId,
    });
  },
);

export const updateProductStock = onCall(
  { region: REGION, maxInstances: 10 },
  async (request) => {
    const adminUid = requireAdmin(request);
    await checkRateLimit(adminUid);

    const input = validateInput(updateProductStockSchema, request.data);
    const db = getFirestore();

    const productRef = db.collection(COLLECTIONS.PRODUCTS).doc(input.productId);

    await db.runTransaction(async (transaction) => {
      const snap = await transaction.get(productRef);
      if (!snap.exists) {
        throw new (await import('firebase-functions/v2/https')).HttpsError(
          'not-found',
          'Product not found',
        );
      }

      const product = snap.data() as Product;
      const newStock = product.stock + input.delta;

      if (newStock < 0) {
        throw new (await import('firebase-functions/v2/https')).HttpsError(
          'failed-precondition',
          `Insufficient stock. Current: ${product.stock}, requested delta: ${input.delta}`,
        );
      }

      transaction.update(productRef, {
        stock: newStock,
        updatedAt: new Date(),
      });
    });

    logger.info('Product stock updated', {
      userId: adminUid,
      action: 'updateProductStock',
      productId: input.productId,
      delta: String(input.delta),
    });
  },
);
