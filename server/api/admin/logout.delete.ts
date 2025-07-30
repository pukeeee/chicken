import {removeToken} from '../../repositories/user.repository'

export default defineEventHandler(async (event) => {
  const user = event.context.auth

  if (user) {
    // Удаляем токен из базы данных
    await removeToken(user.id)
}
  // Удаляем cookie, установив пустое значение и maxAge=0
  setCookie(event, 'admin_token', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 0 // удалить
  })
  
    return { success: true }
  })