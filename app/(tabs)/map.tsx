import { useDatabase } from '@/context/DatabaseContext';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import MapView, { LongPressEvent, Marker, Region } from 'react-native-maps';

export default function MapScreen() {
  const router = useRouter();
  const { addMarker, markers, isLoading, error } = useDatabase();
  const mapRef = useRef<MapView>(null);
  
  const [region] = useState<Region>({
    latitude: 55.751244,
    longitude: 37.618423,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // Принудительно обновляем карту при изменении маркеров
  useEffect(() => {
    console.log('MapScreen: Маркеры обновлены, количество:', markers.length);
  }, [markers]);

  const handleLongPress = async (event: LongPressEvent) => {
    const { coordinate } = event.nativeEvent;
    
    try {
      console.log('MapScreen: Добавление маркера на координаты:', coordinate);
      
      const markerId = await addMarker(
        coordinate.latitude,
        coordinate.longitude,
        `Маркер ${markers.length + 1}`
      );
      
      console.log('MapScreen: Маркер добавлен с ID:', markerId);
      console.log('MapScreen: Всего маркеров теперь:', markers.length);
      
      Alert.alert('Успех', 'Маркер добавлен! Нажмите на него для просмотра.');
    } catch (err) {
      console.error('MapScreen: Ошибка добавления маркера:', err);
      Alert.alert('Ошибка', 'Не удалось добавить маркер');
    }
  };

  const handleMarkerPress = (markerId: string) => {
    console.log('MapScreen: Открытие маркера:', markerId);
    router.push(`/marker/${markerId}`);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#ffd33d" />
        <Text style={styles.loadingText}>Загрузка...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Ошибка загрузки базы данных</Text>
        <Text style={styles.errorSubtext}>{error.message}</Text>
      </View>
    );
  }

  console.log('MapScreen: Рендеринг карты с маркерами:', markers.length);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        key={`map-${markers.length}`} // Принудительный ререндер при изменении количества маркеров
        style={styles.map}
        initialRegion={region}
        onLongPress={handleLongPress}
      >
        {markers.map((marker) => {
          console.log('📌 Рендеринг маркера:', marker.id, marker.title);
          return (
            <Marker
              key={marker.id}
              coordinate={{
                latitude: marker.latitude,
                longitude: marker.longitude,
              }}
              title={marker.title}
              description={`Фото: ${marker.images.length}`}
              onPress={() => handleMarkerPress(marker.id)}
            />
          );
        })}
      </MapView>
      
      {/* Отладочная информация */}
      <View style={styles.debugInfo}>
        <Text style={styles.debugText}>Маркеров: {markers.length}</Text>
        <Text style={styles.debugTextSmall}>
          Долгое нажатие для добавления
        </Text>
      </View>
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
  map: {
    width: '100%',
    height: '100%',
  },
  debugInfo: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 8,
  },
  debugText: {
    color: '#ffd33d',
    fontSize: 14,
    fontWeight: 'bold',
  },
  debugTextSmall: {
    color: '#fff',
    fontSize: 10,
    marginTop: 4,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 12,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
  },
});