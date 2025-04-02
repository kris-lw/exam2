// app/_layout.js
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { initDatabase } from './database/db';

export default function Layout() {
  useEffect(() => {
    const setupDatabase = async () => {
      try {
        await initDatabase();
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };

    setupDatabase();
  }, []);

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Gardening Journal',
        }}
      />
      <Stack.Screen
        name="plant-entry/details/[id]"
        options={{
          title: 'Plant Details',
        }}
      />
      <Stack.Screen
        name="plant-entry/add"
        options={{
          title: 'Add New Plant Entry',
          // presentation: 'modal', // if you want to make the presentation a modal instead of a stack
        }}
      />
      <Stack.Screen
        name="plant-entry/edit/[id]"
        options={{
          title: 'Edit Plant Entry',
        }}
      />
    </Stack>
  );
}