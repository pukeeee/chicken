import { fetchProductById } from '~~/server/services/menuService'
import { idSchema, menuSchemas, type MenuProductResponse } from '~~/shared/validation/schemas'
import { createValidationError } from '~~/server/utils/validation'
import { NotFoundError } from '~~/server/services/errorService'

export default defineEventHandler(async (event) => {
  // Крок 1: Валідація ID з параметрів маршруту
  const paramsValidation = await getValidatedRouterParams(event, (params) => idSchema.safeParse(params))
  if (!paramsValidation.success) {
    const errors: Record<string, string[]> = {};
    paramsValidation.error.issues.forEach(err => {
        const path = err.path.join('.');
        if (!errors[path]) {
            errors[path] = [];
        }
        errors[path].push(err.message);
    });
    throw createValidationError({
        success: false,
        errors: errors,
        message: 'Невірний ID продукту' 
    });
  }
  const productId = paramsValidation.data!.id

  // Крок 2: Отримання продукту
  const product = await fetchProductById(productId)

  // Крок 3: Перевірка, чи знайдено продукт
  if (!product) {
    throw new NotFoundError('Продукт', productId)
  }

  // Крок 4: Формування та валідація відповіді
  // Перетворюємо Decimal на number для відповіді, яку очікує клієнт
  const response: MenuProductResponse = {
    success: true,
    data: {
      ...product,
      price: product.price.toNumber(), // Перетворюємо Decimal на number
    },
  }

  return menuSchemas.productResponse.parse(response)
})