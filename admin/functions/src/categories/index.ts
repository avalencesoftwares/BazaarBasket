// packages/functions/src/categories/index.ts
// Category management Cloud Functions (Admin-only)

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import {
  COLLECTIONS,
  CLOUDINARY_FOLDERS,
  createCategorySchema,
  updateCategorySchema,
  sanitizeObject,
  generateSlug,
} from '@bazaarbasket/shared';
import type { Category } from '@bazaarbasket/shared';
import { requireAdmin } from '../middleware/auth';
import { checkRateLimit } from '../middleware/rateLimiter';
import { validateInput } from '../middleware/validator';
import { uploadImage, deleteImage } from '../utils/cloudinary';
import { logger } from '../utils/logger';

const REGION = 'asia-south1';

export const createCategory = onCall(
  { region: REGION, maxInstances: 10 },
  async (request) => {
    const adminUid = requireAdmin(request);
    await checkRateLimit(adminUid);

    const input = validateInput(createCategorySchema, request.data);
    const sanitized = sanitizeObject({ name: input.name });
    const db = getFirestore();

    let imageUrl = '';
    let imagePublicId = '';

    if (input.image) {
      const result = await uploadImage(
        input.image.base64,
        CLOUDINARY_FOLDERS.CATEGORY_IMAGES,
        `${Date.now()}_${input.image.fileName}`,
      );
      imageUrl = result.url;
      imagePublicId = result.publicId;
    }

    const slug = generateSlug(sanitized.name);
    const now = new Date();

    const categoryData: Omit<Category, 'id'> = {
      name: sanitized.name,
      slug,
      imageUrl,
      imagePublicId,
      sortOrder: input.sortOrder ?? 0,
      isActive: input.isActive ?? true,
      productCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await db.collection(COLLECTIONS.CATEGORIES).add(categoryData);

    logger.info('Category created', {
      userId: adminUid,
      action: 'createCategory',
      categoryId: docRef.id,
    });

    return { categoryId: docRef.id };
  },
);

export const updateCategory = onCall(
  { region: REGION, maxInstances: 10 },
  async (request) => {
    const adminUid = requireAdmin(request);
    await checkRateLimit(adminUid);

    const input = validateInput(updateCategorySchema, request.data);
    const db = getFirestore();

    const categoryRef = db.collection(COLLECTIONS.CATEGORIES).doc(input.categoryId);
    const categorySnap = await categoryRef.get();

    if (!categorySnap.exists) {
      throw new HttpsError('not-found', 'Category not found');
    }

    const existingCategory = categorySnap.data() as Category;
    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (input.name !== undefined) {
      const sanitized = sanitizeObject({ name: input.name });
      updateData.name = sanitized.name;
      updateData.slug = generateSlug(sanitized.name);
    }
    if (input.sortOrder !== undefined) { updateData.sortOrder = input.sortOrder; }
    if (input.isActive !== undefined) { updateData.isActive = input.isActive; }

    // Handle image removal
    if (input.removeImage && existingCategory.imagePublicId) {
      await deleteImage(existingCategory.imagePublicId);
      updateData.imageUrl = '';
      updateData.imagePublicId = '';
    }

    // Handle new image upload
    if (input.image) {
      // Remove old image first
      if (existingCategory.imagePublicId) {
        await deleteImage(existingCategory.imagePublicId);
      }
      const result = await uploadImage(
        input.image.base64,
        CLOUDINARY_FOLDERS.CATEGORY_IMAGES,
        `${Date.now()}_${input.image.fileName}`,
      );
      updateData.imageUrl = result.url;
      updateData.imagePublicId = result.publicId;
    }

    await categoryRef.update(updateData);

    logger.info('Category updated', {
      userId: adminUid,
      action: 'updateCategory',
      categoryId: input.categoryId,
    });
  },
);

export const deleteCategory = onCall(
  { region: REGION, maxInstances: 10 },
  async (request) => {
    const adminUid = requireAdmin(request);
    await checkRateLimit(adminUid);

    const { categoryId } = request.data as { categoryId: string };
    if (!categoryId) {
      throw new HttpsError('invalid-argument', 'Category ID is required');
    }

    const db = getFirestore();
    const categoryRef = db.collection(COLLECTIONS.CATEGORIES).doc(categoryId);
    const categorySnap = await categoryRef.get();

    if (!categorySnap.exists) {
      throw new HttpsError('not-found', 'Category not found');
    }

    const category = categorySnap.data() as Category;

    // Check if category has products
    if (category.productCount > 0) {
      throw new HttpsError(
        'failed-precondition',
        `Cannot delete category with ${category.productCount} product(s). Move or delete them first.`,
      );
    }

    // Delete image from Cloudinary
    if (category.imagePublicId) {
      await deleteImage(category.imagePublicId);
    }

    await categoryRef.delete();

    logger.info('Category deleted', {
      userId: adminUid,
      action: 'deleteCategory',
      categoryId,
    });
  },
);
