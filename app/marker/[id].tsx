import { useDatabase } from '@/context/DatabaseContext';
import { MarkerData } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';


export default function MarkerDetails() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const markerId = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const { getMarker, addImageToMarker, deleteImage, deleteMarker } = useDatabase();
  
  const [marker, setMarker] = useState<MarkerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Загружаем маркер при каждом фокусе на экране
  useFocusEffect(
    useCallback(() => {
      loadMarker();
    }, [markerId])
  );

  useEffect(() => {
    requestPermissions();
  }, []);

  const loadMarker = async () => {
    if (!markerId) return;
    
    try {
      setIsLoading(true);
      console.log('MarkerDetails: Загрузка маркера:', markerId);
      
      const loadedMarker = await getMarker(parseInt(markerId));
      
      console.log('MarkerDetails: Маркер загружен:', loadedMarker);
      setMarker(loadedMarker);
    } catch (err) {
      console.error('MarkerDetails: Ошибка загрузки маркера:', err);
      Alert.alert('Ошибка', 'Не удалось загрузить маркер');
    } finally {
      setIsLoading(false);
    }
  };

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Требуется разрешение',
        'Пожалуйста дайте разрешение на доступ к галерее!'
      );
    }
  };

  const pickImage = async () => {
    if (!markerId) return;
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        console.log('MarkerDetails: Добавление изображения...');
        
        await addImageToMarker(parseInt(markerId), result.assets[0].uri);
        
        console.log('MarkerDetails: Изображение добавлено');
        
        // Перезагружаем маркер для отображения нового изображения
        await loadMarker();
        
        Alert.alert('Успех', 'Фотография добавлена!');
      }
    } catch (error) {
      console.error('MarkerDetails: Ошибка добавления фото:', error);
      Alert.alert('Ошибка', 'Произошла ошибка при выборе фото, попробуйте еще позже.');
    }
  };

  const handleDeleteImage = (imageId: string) => {
    if (!markerId) return;
    
    Alert.alert(
      'Удаление фотографии',
      'Вы уверены что хотите удалить фотографию?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('MarkerDetails: Удаление изображения:', imageId);
              
              await deleteImage(parseInt(markerId), parseInt(imageId));
              
              console.log('MarkerDetails: Изображение удалено');
              
              // Перезагружаем маркер
              await loadMarker();
              
              Alert.alert('Успех', 'Фотография удалена');
            } catch (err) {
              console.error('MarkerDetails: Ошибка удаления фото:', err);
              Alert.alert('Ошибка', 'Не удалось удалить фотографию');
            }
          },
        },
      ]
    );
  };

  const handleDeleteMarker = () => {
    if (!markerId) return;
    
    Alert.alert(
      'Удаление маркера',
      'Вы уверены что хотите удалить этот маркер и все его фотографии?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('MarkerDetails: Удаление маркера:', markerId);
              
              await deleteMarker(parseInt(markerId));
              
              console.log('MarkerDetails: Маркер удален');
              
              Alert.alert('Успех', 'Маркер удален', [
                { text: 'OK', onPress: () => router.back() }
              ]);
            } catch (err) {
              console.error('MarkerDetails: Ошибка удаления маркера:', err);
              Alert.alert('Ошибка', 'Не удалось удалить маркер');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#ffd33d" />
        <Text style={styles.loadingText}>Загрузка...</Text>
      </View>
    );
  }

  if (!marker) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="alert-circle-outline" size={64} color="#666" />
        <Text style={styles.errorText}>Маркер не найден</Text>
        <Text style={styles.errorSubtext}>ID: {markerId || 'не определён'}</Text>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Вернуться к карте</Text>
        </TouchableOpacity>
      </View>
    );
  }

  console.log('MarkerDetails: Рендеринг маркера с фото:', marker.images.length);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Информация:</Text>
          <Text style={styles.infoText}>Маркер: {marker.title}</Text>
          <Text style={styles.infoText}>
            Координаты: {marker.latitude.toFixed(4)}, {marker.longitude.toFixed(4)}
          </Text>
          <Text style={styles.infoText}>Фотографии: {marker.images.length}</Text>
          
          <TouchableOpacity 
            style={styles.deleteMarkerButton}
            onPress={handleDeleteMarker}
          >
            <Ionicons name="trash-outline" size={20} color="#fff" />
            <Text style={styles.deleteMarkerButtonText}>Удалить маркер</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.imagesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Фотографии</Text>
            <TouchableOpacity onPress={pickImage} style={styles.addButton}>
              <Ionicons name="add-circle" size={32} color="#ffd33d" />
              <Text style={styles.addButtonText}>Добавить фото</Text>
            </TouchableOpacity>
          </View>

          {marker.images.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="images-outline" size={64} color="#666" />
              <Text style={styles.emptyText}>Фотографий еще нет</Text>
              <Text style={styles.emptySubtext}>
                {`Нажмите "Добавить фото" чтобы начать`}
              </Text>
            </View>
          ) : (
            <View style={styles.imageGrid}>
              {marker.images.map((image) => (
                <View key={image.id} style={styles.imageContainer}>
                  <Image source={{ uri: image.uri }} style={styles.image} />
                  <TouchableOpacity
                    onPress={() => handleDeleteImage(image.id)}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="close-circle" size={28} color="#ff4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 12,
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 16,
    fontWeight: 'bold',
  },
  errorSubtext: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  backButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#ffd33d',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#25292e',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoSection: {
    padding: 16,
    backgroundColor: '#1a1d21',
    margin: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 8,
  },
  deleteMarkerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ff4444',
    borderRadius: 8,
  },
  deleteMarkerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  imagesSection: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addButtonText: {
    color: '#ffd33d',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageContainer: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 14,
  },
});