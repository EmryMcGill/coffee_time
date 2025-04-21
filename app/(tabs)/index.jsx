import React, { useState } from 'react';
import { 
  RefreshControl, 
  Alert, 
  View, 
  StyleSheet, 
  FlatList, 
  Image,
  Text
} from 'react-native';
import CoffeeCard from '@/components/CoffeeCard';
import { usePocket } from '@/context/pocketbase';
import { useDrinkContext } from '@/context/drinkContext';
import * as Haptics from 'expo-haptics';
import coffee from "@/assets/images/coffee.png"

const Index = () => {  
  const { 
    isLoggedIn, 
  } = usePocket();

  const { drinks, deleteDrink, fetchDrinks } = useDrinkContext();

  const handleDeleteDrink = async (id) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
        'Delete Drink',
        'Are you sure you want to delete this ?',
        [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
            await deleteDrink(id);
            await fetchDrinks();
        }},
        ],
        { cancelable: true }
    );
  }
  const [refreshing, setRefreshing] = useState(false);

  return (
    <View style={styles.container}>
      <FlatList 
        ListEmptyComponent={
          <View style={styles.def_image_container}>
            <Image source={require('../../assets/images/coffee.png')} style={styles.def_image} />
            <Text style={{fontSize: 20}}>Add your first coffee</Text>
            <Image source={require('../../assets/images/arrow.png')} style={styles.arrow_image} />
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={async () => {
            setRefreshing(true);
            await fetchDrinks();
            setRefreshing(false);
          }} />
        }
        contentContainerStyle={{ paddingBottom: 5, flexGrow: 1 }}
        data={drinks}
        renderItem={({item}) => (
            <CoffeeCard 
              title={item.title}
              beans={item.beans}
              inWeight={item.doseWeight}
              outWeight={item.yieldWeight}
              grindSize={item.grindSize}
              time={item.brewTime}
              notes={item.notes}
              image={item.image}
              postUser={item.user}
              created={item.created}
              name={item.name ? item.name : item.user}
              id={String(item.id)}
              avatar={item.avatarURL}
              handleDelete={handleDeleteDrink}
            />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
    paddingVertical: 0,
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
  def_image_container: {
    display: 'flex',
    alignItems: 'center',
    opacity: '0.5',
    height: '100%',
  },
  def_image: {
    height: 250,
    aspectRatio: 1/1,
    marginTop: 'auto'
  },
  arrow_image: {
    height: 150,
    width: 0,
    aspectRatio: 1/1,
  }
});

export default Index;