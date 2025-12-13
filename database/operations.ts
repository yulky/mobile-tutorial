import * as SQLite from 'expo-sqlite';
import { DBMarker, DBMarkerImage } from '../types';

export class DatabaseOperations {
  constructor(private db: SQLite.SQLiteDatabase) {}

  // ============ МАРКЕРЫ ============
  
  async addMarker(latitude: number, longitude: number, title: string): Promise<number> {
    try {
      const result = await this.db.runAsync(
        'INSERT INTO markers (latitude, longitude, title) VALUES (?, ?, ?)',
        [latitude, longitude, title]
      );
      console.log('Маркер добавлен, ID:', result.lastInsertRowId);
      return result.lastInsertRowId;
    } catch (error) {
      console.error('Ошибка добавления маркера:', error);
      throw new Error('Не удалось добавить маркер');
    }
  }

  async getMarkers(): Promise<DBMarker[]> {
    try {
      const markers = await this.db.getAllAsync<DBMarker>(
        'SELECT * FROM markers ORDER BY created_at DESC'
      );
      console.log('Получено маркеров:', markers.length);
      return markers;
    } catch (error) {
      console.error('Ошибка получения маркеров:', error);
      throw new Error('Не удалось получить маркеры');
    }
  }

  async getMarker(id: number): Promise<DBMarker | null> {
    try {
      const marker = await this.db.getFirstAsync<DBMarker>(
        'SELECT * FROM markers WHERE id = ?',
        [id]
      );
      return marker || null;
    } catch (error) {
      console.error('Ошибка получения маркера:', error);
      throw new Error('Не удалось получить маркер');
    }
  }

  async deleteMarker(id: number): Promise<void> {
    try {
      // Благодаря CASCADE, изображения удалятся автоматически
      await this.db.runAsync('DELETE FROM markers WHERE id = ?', [id]);
      console.log('Маркер удален, ID:', id);
    } catch (error) {
      console.error('Ошибка удаления маркера:', error);
      throw new Error('Не удалось удалить маркер');
    }
  }

  // ============ ИЗОБРАЖЕНИЯ ============

  async addImage(markerId: number, uri: string): Promise<number> {
    try {
      const result = await this.db.runAsync(
        'INSERT INTO marker_images (marker_id, uri) VALUES (?, ?)',
        [markerId, uri]
      );
      console.log('Изображение добавлено, ID:', result.lastInsertRowId);
      return result.lastInsertRowId;
    } catch (error) {
      console.error('Ошибка добавления изображения:', error);
      throw new Error('Не удалось добавить изображение');
    }
  }

  async getMarkerImages(markerId: number): Promise<DBMarkerImage[]> {
    try {
      const images = await this.db.getAllAsync<DBMarkerImage>(
        'SELECT * FROM marker_images WHERE marker_id = ? ORDER BY created_at DESC',
        [markerId]
      );
      console.log('Получено изображений для маркера', markerId, ':', images.length);
      return images;
    } catch (error) {
      console.error('Ошибка получения изображений:', error);
      throw new Error('Не удалось получить изображения');
    }
  }

  async deleteImage(id: number): Promise<void> {
    try {
      await this.db.runAsync('DELETE FROM marker_images WHERE id = ?', [id]);
      console.log('Изображение удалено, ID:', id);
    } catch (error) {
      console.error('Ошибка удаления изображения:', error);
      throw new Error('Не удалось удалить изображение');
    }
  }

  // ============ УТИЛИТЫ ============

  async clearAllData(): Promise<void> {
    try {
      await this.db.runAsync('DELETE FROM marker_images');
      await this.db.runAsync('DELETE FROM markers');
      console.log('Все данные удалены');
    } catch (error) {
      console.error('Ошибка очистки данных:', error);
      throw new Error('Не удалось очистить данные');
    }
  }
}