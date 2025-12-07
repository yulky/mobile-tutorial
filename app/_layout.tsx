import { DatabaseProvider } from '@/context/DatabaseContext';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <DatabaseProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="marker/[id]" 
          options={{ 
            title: 'Маркер',
            headerStyle: {
              backgroundColor: '#25292e',
            },
            headerTintColor: '#fff',
            headerBackTitle: 'Назад',
          }} 
        />
      </Stack>
    </DatabaseProvider>
  );
}