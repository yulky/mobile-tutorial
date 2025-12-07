import * as SQLite from 'expo-sqlite';

export interface DBMarker {
  id: number;
  latitude: number;
  longitude: number;
  title: string;
  created_at: string;
}

export interface DBMarkerImage {
  id: number;
  marker_id: number;
  uri: string;
  created_at: string;
}

export const initDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  try {
    const db = await SQLite.openDatabaseAsync('markers.db');
    
    // Включаем поддержку внешних ключей
    await db.execAsync('PRAGMA foreign_keys = ON;');
    
    // Создаем таблицу маркеров
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS markers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        title TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Создаем таблицу изображений
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS marker_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        marker_id INTEGER NOT NULL,
        uri TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (marker_id) REFERENCES markers (id) ON DELETE CASCADE
      );
    `);
    
    console.log('База данных инициализирована успешно');
    return db;
  } catch (error) {
    console.error('Ошибка инициализации базы данных:', error);
    throw error;
  }
};