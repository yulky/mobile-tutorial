import { DatabaseOperations } from '@/database/operations';
import { initDatabase } from '@/database/schema';
import { ImageData, MarkerData } from '@/types';
import * as SQLite from 'expo-sqlite';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

interface DatabaseContextType {
  // Операции с маркерами
  addMarker: (latitude: number, longitude: number, title: string) => Promise<number>;
  getMarkers: () => Promise<MarkerData[]>;
  getMarker: (id: number) => Promise<MarkerData | null>;
  deleteMarker: (id: number) => Promise<void>;
  
  // Операции с изображениями
  addImageToMarker: (markerId: number, uri: string) => Promise<void>;
  getMarkerImages: (markerId: number) => Promise<ImageData[]>;
  deleteImage: (markerId: number, imageId: number) => Promise<void>;
  
  // Статусы
  isLoading: boolean;
  error: Error | null;
  
  // Утилиты
  refreshMarkers: () => Promise<void>;
  
  // Кэшированные маркеры
  markers: MarkerData[];
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [operations, setOperations] = useState<DatabaseOperations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [markers, setMarkers] = useState<MarkerData[]>([]);

  // Инициализация базы данных
  useEffect(() => {
    const setupDatabase = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const database = await initDatabase();
        const ops = new DatabaseOperations(database);
        
        setDb(database);
        setOperations(ops);
        
        // Загружаем существующие маркеры
        await loadMarkers(ops);
        
        setIsLoading(false);
      } catch (err) {
        console.error('Ошибка настройки базы данных:', err);
        setError(err as Error);
        setIsLoading(false);
      }
    };

    setupDatabase();
  }, []);

  const loadMarkers = useCallback(async (ops: DatabaseOperations) => {
    try {
      const dbMarkers = await ops.getMarkers();
      const markersWithImages = await Promise.all(
        dbMarkers.map(async (dbMarker) => {
          const images = await ops.getMarkerImages(dbMarker.id);
          return {
            id: dbMarker.id.toString(),
            latitude: dbMarker.latitude,
            longitude: dbMarker.longitude,
            title: dbMarker.title,
            images: images.map(img => ({
              id: img.id.toString(),
              uri: img.uri,
              timestamp: new Date(img.created_at).getTime(),
            })),
          };
        })
      );
      console.log('DatabaseContext: Маркеры загружены:', markersWithImages.length);
      setMarkers(markersWithImages);
      return markersWithImages;
    } catch (err) {
      console.error('DatabaseContext: Ошибка загрузки маркеров:', err);
      throw err;
    }
  }, []);

  const refreshMarkers = useCallback(async (): Promise<void> => {
    if (!operations) {
      console.warn('DatabaseContext: Операции не инициализированы');
      return;
    }
    console.log('DatabaseContext: Обновление маркеров...');
    await loadMarkers(operations);
  }, [operations, loadMarkers]);

  const addMarker = async (latitude: number, longitude: number, title: string): Promise<number> => {
    if (!operations) throw new Error('База данных не инициализирована');
    
    try {
      console.log('DatabaseContext: Добавление маркера...');
      const id = await operations.addMarker(latitude, longitude, title);
      console.log('DatabaseContext: Маркер добавлен с ID:', id);
      
      // Сразу обновляем состояние
      await refreshMarkers();
      
      return id;
    } catch (err) {
      console.error('DatabaseContext: Ошибка добавления маркера:', err);
      setError(err as Error);
      throw err;
    }
  };

  const getMarkers = async (): Promise<MarkerData[]> => {
    // Всегда возвращаем актуальное состояние
    return markers;
  };

  const getMarker = async (id: number): Promise<MarkerData | null> => {
    if (!operations) throw new Error('База данных не инициализирована');
    
    // Загружаем свежие данные из БД
    try {
      const dbMarker = await operations.getMarker(id);
      if (!dbMarker) return null;
      
      const images = await operations.getMarkerImages(id);
      
      return {
        id: dbMarker.id.toString(),
        latitude: dbMarker.latitude,
        longitude: dbMarker.longitude,
        title: dbMarker.title,
        images: images.map(img => ({
          id: img.id.toString(),
          uri: img.uri,
          timestamp: new Date(img.created_at).getTime(),
        })),
      };
    } catch (err) {
      console.error('DatabaseContext: Ошибка получения маркера:', err);
      return null;
    }
  };

  const deleteMarker = async (id: number): Promise<void> => {
    if (!operations) throw new Error('База данных не инициализирована');
    
    try {
      console.log('DatabaseContext: Удаление маркера:', id);
      await operations.deleteMarker(id);
      console.log('DatabaseContext: Маркер удален');
      
      // Сразу обновляем состояние
      await refreshMarkers();
    } catch (err) {
      console.error('DatabaseContext: Ошибка удаления маркера:', err);
      setError(err as Error);
      throw err;
    }
  };

  const addImageToMarker = async (markerId: number, uri: string): Promise<void> => {
    if (!operations) throw new Error('База данных не инициализирована');
    
    try {
      console.log('DatabaseContext: Добавление изображения к маркеру:', markerId);
      await operations.addImage(markerId, uri);
      console.log('DatabaseContext: Изображение добавлено');
      
      // Сразу обновляем состояние
      await refreshMarkers();
    } catch (err) {
      console.error('DatabaseContext: Ошибка добавления изображения:', err);
      setError(err as Error);
      throw err;
    }
  };

  const getMarkerImages = async (markerId: number): Promise<ImageData[]> => {
    if (!operations) throw new Error('База данных не инициализирована');
    
    try {
      const images = await operations.getMarkerImages(markerId);
      return images.map(img => ({
        id: img.id.toString(),
        uri: img.uri,
        timestamp: new Date(img.created_at).getTime(),
      }));
    } catch (err) {
      console.error('DatabaseContext: Ошибка получения изображений:', err);
      return [];
    }
  };

  const deleteImage = async (markerId: number, imageId: number): Promise<void> => {
    if (!operations) throw new Error('База данных не инициализирована');
    
    try {
      console.log('DatabaseContext: Удаление изображения:', imageId);
      await operations.deleteImage(imageId);
      console.log('DatabaseContext: Изображение удалено');
      
      // Сразу обновляем состояние
      await refreshMarkers();
    } catch (err) {
      console.error('DatabaseContext: Ошибка удаления изображения:', err);
      setError(err as Error);
      throw err;
    }
  };

  const value: DatabaseContextType = {
    addMarker,
    getMarkers,
    getMarker,
    deleteMarker,
    addImageToMarker,
    getMarkerImages,
    deleteImage,
    isLoading,
    error,
    refreshMarkers,
    markers, // Добавляем в value
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
}