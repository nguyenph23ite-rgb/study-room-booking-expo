import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import RoomListScreen from './src/screens/RoomListScreen';
import RoomDetailScreen from './src/screens/RoomDetailScreen';
import MyBookingsScreen from './src/screens/MyBookingsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { useStore } from './src/store/useStore';
import './src/utils/notifications'; // đăng ký notification handler
import { RootStackParamList } from './src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function Tabs() {
  const count = useStore((s) => s.bookings.length);
  return (
    <Tab.Navigator>
      <Tab.Screen name="Phòng" component={RoomListScreen} />
      <Tab.Screen
        name="Lịch của tôi"
        component={MyBookingsScreen}
        options={{ tabBarBadge: count > 0 ? count : undefined }}
      />
      <Tab.Screen name="Tài khoản" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator>
        <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
        <Stack.Screen name="RoomDetail" component={RoomDetailScreen} options={{ title: 'Đặt phòng' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
