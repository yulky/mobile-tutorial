import { useMarkers } from '@/context/MarkerContext';
import { MarkerData } from '@/types';
import { useRouter } from 'expo-router';
import { Alert, StyleSheet, Text, View } from 'react-native';
import MapView, { LongPressEvent, Marker } from 'react-native-maps';

const region = {
  latitude: 55.751244,
  longitude: 37.618423,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export default function MapScreen() {
  const router = useRouter();
  const { markers, addMarker } = useMarkers();

  const handleLongPress = (event: LongPressEvent) => {
    const { coordinate } = event.nativeEvent;
    const newMarker: MarkerData = {
      id: Date.now().toString(),
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      title: `Маркер ${markers.length + 1}`,
      images: [],
    };

    addMarker(newMarker);
    Alert.alert('Успех', 'Маркер добавлен! Нажмите на него для просмотра.');
  };

  const handleMarkerPress = (markerId: string) => {
    router.push(`/marker/${markerId}`);
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={region}
        onLongPress={handleLongPress}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            title={marker.title}
            onPress={() => handleMarkerPress(marker.id)}
          />
        ))}
      </MapView>
      
      <View style={styles.allMarkers}>
        <Text style={styles.allMarkersText}>Маркеров: {markers.length}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  allMarkers: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 5,
  },
  allMarkersText: {
    color: '#fff',
    fontSize: 12,
  },
});