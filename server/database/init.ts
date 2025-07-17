import sqlite3 from 'sqlite3'
const { Database } = sqlite3

export function initDatabase() {
  const db = new Database('./database.sqlite')
  
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price INTEGER NOT NULL,
        image_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // Заполняем тестовыми данными
    db.run(`
      INSERT OR IGNORE INTO menu_items (id, name, description, price, image_url) 
      VALUES 
        (1, 'Курочка №1', 'Соковита курочка гриль', 200, '/menu1.jpg'),
        (2, 'Курочка №2', 'Соковита курочка гриль', 200, '/menu2.jpg'),
        (3, 'Курочка №3', 'Соковита курочка гриль', 200, '/menu3.jpg')
    `)
  })
  
  return db
}