import { 
  Text, 
  View, 
  StyleSheet,
  Pressable,
  Image,
  Button,
  FlatList,
  Alert,
  ScrollView
} from "react-native";
import { usePocket } from '@/context/pocketbase';
import { useRouter } from "expo-router";
import { useEffect, useState } from 'react';
import { useDrinkContext } from '@/context/drinkContext';
import CoffeeCard from '@/components/CoffeeCard';
import * as Haptics from 'expo-haptics';
import Ionicons from "@expo/vector-icons/Ionicons";

export default function Profile() {

  const { drinks, deleteDrink, fetchDrinks } = useDrinkContext();

  const { 
    isLoggedIn, 
    user,
    getUser
  } = usePocket();
  const router = useRouter();

  const [avatarURI, setAvatarURI] = useState("");

  useEffect(() => {
    const handleAvatar = async () => {
      if (isLoggedIn) {
        setAvatarURI(`${process.env.EXPO_PUBLIC_PB_URI}/api/files/users/${user.id}/${user.avatar}`);
      }
    }
    handleAvatar();
  }, [user]);

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

  return (
      <FlatList 
        ListEmptyComponent={
          <View style={styles.def_image_container}>
            <Image source={require('../../assets/images/coffee.png')} style={styles.def_image} />
            <Text style={{fontSize: 20}}>Add your first coffee</Text>
            <Image source={require('../../assets/images/arrow.png')} style={styles.arrow_image} />
          </View>
        }
        ListHeaderComponent={
          <>
          { isLoggedIn ?
            <View style={styles.profileContainer}>
              <View style={styles.profileTopContainer}>
                {user?.avatar && avatarURI ?
                  <Image source={{ uri: avatarURI }} style={styles.avatar} />
                :
                  <Ionicons name='person-circle-outline' size={80} color='#949494' />
                }
                <View style={styles.profileInfoContainer}>
                  <Text style={styles.name}>{user.name}</Text>
                  <View style={styles.machine_container}>
                    <Image source={require('../../assets/images/machine_img.png')} style={styles.icon} />
                    <Text style={styles.machine}>{user.machine ? user.machine : 'machine'}</Text>
                  </View>
                  <View style={styles.machine_container}>
                    <Image source={require('../../assets/images/grinder_img.png')} style={styles.icon} />
                    <Text style={styles.machine}>{user.grinder ? user.grinder : 'grinder'}</Text>
                  </View>
                </View>
                
              </View>
              <View style={styles.profileBottomContainer}>
                <Pressable 
                  style={{alignItems: 'center', gap: 5}}
                  onPress={() => router.push('/following')}
                >
                  <Text>Following</Text>
                  <Text style={{fontWeight: 'bold'}}>{user?.following?.length}</Text>
                </Pressable>
                <Pressable
                  onPress={() => router.push('/editProfile')}
                  style={{ justifyContent: 'flex-end', paddingLeft: 10}}
                >
                  <Ionicons name='settings-outline' size={24} />
                </Pressable>
              </View>
            </View>
            :
            <View style={styles.profileContainer}>
              <Text style={styles.loginText}>Login or sign up to share your drinks with friends!</Text>
              <View style={styles.loginButtonsContainer}>
                <Pressable style={styles.loginButton} onPress={() => router.push('/login')}>
                  <Text style={{color: 'white', fontWeight: 'bold'}}>Login</Text>
                </Pressable>
                <Pressable style={styles.loginButton} onPress={() => router.push('/signup')}>
                  <Text style={{color: 'white', fontWeight: 'bold'}}>Sign Up</Text>
                </Pressable>
              </View>
            </View>
          }
                <Text style={{fontWeight: 'bold', marginTop: 5, marginLeft: 5}}>My Drinks</Text>

          </>
        }
        contentContainerStyle={{ 
          paddingBottom: 5, 
          paddingHorizontal: 5, 
          flexGrow: 1
        }}
        data={drinks?.filter(item => item.user === user?.id || item.user === 'guest')}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
    paddingVertical: 0
  },
  profileContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginTop: 5,
    width: '100%',
  },
  profileTopContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  profileInfoContainer: {
    flex: 1,
    minWidth: 0,
    gap: 2
  },
  profileBottomContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
  },
  machine_container: {
    flexDirection: 'row', 
    alignItems: 'start',
    minWidth: 0
  },
  name: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 5
  },
  icon: {
    width:25,
    aspectRatio: 1/1
  },
  machine: {
    fontSize: 16,
    color: 'grey',
    flexShrink: 1
  },
  loginText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  loginButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 8,
  },
  loginButtonsContainer: {
    flexDirection: 'row',
    gap: 20
  },
  avatar: {
    height: 80,
    width: 80,
    borderRadius: "50%"
  },
  avatarContainer: {
    flexDirection: 'row', 
    gap: 15, 
    alignItems: 'flex-start', 
    width: "100%",
    backgroundColor: 'blue',
    flexWrap: 'wrap'
  },
  def_image_container: {
    display: 'flex',
    alignItems: 'center',
    opacity: '0.5',
    flex: 1,
  },
  def_image: {
    height: 200,
    aspectRatio: 1/1,
    marginTop: 'auto'
  },
  arrow_image: {
    height: 100,
    width: 0,
    aspectRatio: 1/1,
  }
});