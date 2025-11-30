import { ImageData, MarkerData } from '@/types';
import React, { createContext, ReactNode, useContext, useState } from 'react';

interface MarkerContextType {
  markers: MarkerData[];
  addMarker: (marker: MarkerData) => void;
  getMarker: (id: string) => MarkerData | undefined;
  addImageToMarker: (markerId: string, image: ImageData) => void;
  removeImageFromMarker: (markerId: string, imageId: string) => void;
}

const MarkerContext = createContext<MarkerContextType | undefined>(undefined);

export function MarkerProvider({ children }: { children: ReactNode }) {
  const [markers, setMarkers] = useState<MarkerData[]>([]);

  const addMarker = (marker: MarkerData) => {
    console.log('Adding marker to context:', marker);
    setMarkers((prev) => {
      const newMarkers = [...prev, marker];
      console.log('All markers after add:', newMarkers);
      return newMarkers;
    });
  };

  const getMarker = (id: string) => {
    console.log('Getting marker with id:', id);
    console.log('Available markers:', markers);
    const found = markers.find((marker) => marker.id === id);
    console.log('Found marker:', found);
    return found;
  };

  const addImageToMarker = (markerId: string, image: ImageData) => {
    setMarkers((prev) =>
      prev.map((marker) =>
        marker.id === markerId
          ? { ...marker, images: [...marker.images, image] }
          : marker
      )
    );
  };

  const removeImageFromMarker = (markerId: string, imageId: string) => {
    setMarkers((prev) =>
      prev.map((marker) =>
        marker.id === markerId
          ? {
              ...marker,
              images: marker.images.filter((img) => img.id !== imageId),
            }
          : marker
      )
    );
  };

  return (
    <MarkerContext.Provider
      value={{
        markers,
        addMarker,
        getMarker,
        addImageToMarker,
        removeImageFromMarker,
      }}
    >
      {children}
    </MarkerContext.Provider>
  );
}

export function useMarkers() {
  const context = useContext(MarkerContext);
  if (context === undefined) {
    throw new Error('useMarkers must be used within a MarkerProvider');
  }
  return context;
}