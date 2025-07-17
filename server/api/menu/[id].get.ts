import sqlite3 from 'sqlite3'

const { Database } = sqlite3.verbose()
const db = new Database('./database.sqlite')

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'No id provided' })
  }

  try {
    const item = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM menu_items WHERE id = ?', id, (err, row) => {
        if (err) return reject(err)
        resolve(row)
      })
    })
    if (!item) {
      throw createError({ statusCode: 404, statusMessage: 'Menu item not found' })
    }
    return item
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Database error'
    })
  }
})
