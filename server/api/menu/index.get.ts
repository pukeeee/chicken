import sqlite3 from 'sqlite3'
import { promisify } from 'util'

const { Database } = sqlite3.verbose()
const db = new Database('./database.sqlite')
const dbAll = promisify(db.all.bind(db))

export default defineEventHandler(async (event) => {
  try {
    const menu = await dbAll('SELECT * FROM menu_items')
    return {
      success: true,
      data: menu
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Database error'
    })
  }
})