import { useMarkers } from '@/context/MarkerContext';
import { ImageData } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import {
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
  const markerId = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const { getMarker, addImageToMarker, removeImageFromMarker, markers } = useMarkers();
  
  const marker = markerId ? getMarker(markerId) : undefined;
  
  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Требуется разрешение',
        'Пожалуйста дайте разрешение!'
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
        const newImage: ImageData = {
          id: Date.now().toString(),
          uri: result.assets[0].uri,
          timestamp: Date.now(),
        };
        addImageToMarker(markerId, newImage);
      }
    } 
    catch (error) {
      Alert.alert('Ошибка', 'Произошла ошибка при выборе фото, попробуйте еще позже.');
      console.error('Image picker error:', error);
    }
  };

  const deleteImage = (imageId: string) => {
    if (!markerId) return;
    
    Alert.alert(
      'Удаление фотографии',
      'Вы уверены что хотите удалить фотографию?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: () => {
            removeImageFromMarker(markerId, imageId);
          },
        },
      ]
    );
  };

  if (!marker) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="alert-circle-outline" size={64} color="#666" />
        <Text style={styles.errorText}>Маркер не найден</Text>
        <Text style={styles.errorSubtext}>ID: {markerId || 'не определён'}</Text>
        <Text style={styles.errorSubtext}>Всего маркеров: {markers.length}</Text>
      </View>
    );
  }

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
                    onPress={() => deleteImage(image.id)}
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