import { codeService } from '~~/server/services/users/codeService'
import { loginService } from '~~/server/services/users/loginService'
import { authSchemas, userSchemas, type UserLoginResponse } from '~~/shared/validation/schemas'
import { validateBody, createValidationError, ValidationErrors } from '~~/server/utils/validation'
import { AppError } from '~~/server/services/errorService'

export default defineEventHandler(async (event) => {
  // Крок 1: Валідація вхідних даних
  const validationResult = await validateBody(event, authSchemas.login)

  if (!validationResult.success) {
    throw createValidationError(validationResult)
  }
  
  const { phone, code } = validationResult.data!

  // Крок 2: Перевірка коду
  const isCodeValid = await codeService.verify(phone, code)
  
  if (!isCodeValid) {
    throw new AppError(400, ValidationErrors.CODE_INVALID, 'CODE_INVALID')
  }

  // Крок 3: Отримання або створення користувача
  const { user, token } = await loginService.getOrCreateUser(phone)

  // Встановлюємо cookie з токеном
  setCookie(event, 'user_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 30, // 30 днів
  })

  // Крок 4: Формування та валідація відповіді
  const response: UserLoginResponse = {
    success: true,
    message: 'Успішний вхід в систему',
    user: {
      id: user.id,
      phone: user.phone,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
    },
  }

  // Nitro автоматично виведе схему відповіді з цього типу
  return userSchemas.loginResponse.parse(response)
})