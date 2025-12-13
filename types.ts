export interface MarkerData {
  id: string; // Строка для совместимости, но в БД это число
  latitude: number;
  longitude: number;
  title: string;
  images: ImageData[];
}

export interface ImageData {
  id: string; // Строка для совместимости, но в БД это число
  uri: string;
  timestamp: number;
}

export interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

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