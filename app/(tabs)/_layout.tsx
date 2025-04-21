import { Tabs, Link } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Text, Button, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { usePocket } from '@/context/pocketbase';
import { useState } from 'react';
import CreateModal from '../../components/CreateModal';

export default function TabLayout() {
  const [modalVisible, setModalVisible] = useState(false);
  const { 
    isLoggedIn, 
  } = usePocket();
  const router = useRouter();
  return (
    <>
    <Tabs
        screenOptions={{
            tabBarActiveTintColor: '#FD9C2C',
            tabBarInactiveTintColor: 'black',
            tabBarShowLabel: false,
            tabBarStyle: {
            }
        }} >
      {isLoggedIn ?
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'home' : 'home-outline'} color={color} size={24} />
            ), 
          headerLeft: () => ( 
            <Pressable
              onPress={() => {
                router.push('../search');
              }}
              style={{ paddingHorizontal: 16 }}
            >
              <Ionicons name="search" size={24} color="black" />
            </Pressable>
          )
        }}
      />
      :
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'home' : 'home-outline'} color={color} size={30} />
            ), 
        }}
      />
      }
      <Tabs.Screen 
        name="create" 
        options={{ 
            title: 'New Drink',
            tabBarButton: () => (
              <Pressable 
                onPress={() => setModalVisible(true)}
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%'
                }}
              >
                <Ionicons 
                  name={'add-circle-outline'} 
                  size={35} 
                  color="black"
                />
              </Pressable>
              ),
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
                <Ionicons 
                  name={focused ? 'person-circle' : 'person-circle-outline'} 
                  color={color} 
                  size={30} 
                />
              ),
        }} 
      />
    </Tabs>

    <CreateModal setModalVisible={setModalVisible} modalVisible={modalVisible} />
</>
  );
}
