import React, { useState } from 'react';
import { 
  Text, 
  StyleSheet, 
  Pressable, 
  TextInput, 
  Alert,
  Image,
  ScrollView,
  View
} from 'react-native';
import { useRouter } from 'expo-router';
import { usePocket } from '@/context/pocketbase';
import * as ImagePicker from 'expo-image-picker';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as FileSystem from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { useDrinkContext } from '@/context/drinkContext';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const EditProfile = () => {

  // hooks
  const router = useRouter();
  const machineRef = React.useRef(null);
  const grinderRef = React.useRef(null);
  const { fetchDrinks } = useDrinkContext();

  const { 
    editProfile,
    user,
    logout
 } = usePocket();

  const [name, setName] = useState(user.name);
  const [machine, setMachine] = useState(user.machine);
  const [grinder, setGrinder] = useState(user.grinder);
  const [avatar, setAvatar] = useState("");
  const [avatarURI, setAvatarURI] = useState(user?.avatar ? `${process.env.EXPO_PUBLIC_PB_URI}/api/files/users/${user?.id}/${user?.avatar}` : null);

  const handleChange = async () => {
    const status = await editProfile(name, machine, grinder, avatar);

    // go to profile screen
    if (status === 200) {
      await fetchDrinks();
      router.back();
    }
  }

  const pickImage = async () => {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
  
      const choice = await new Promise((resolve) => {
        Alert.alert(
          "Choose Image",
          "Would you like to take a new photo or select from the gallery?",
          [
            { text: "Camera", onPress: () => resolve("camera") },
            { text: "Gallery", onPress: () => resolve("gallery") },
            { text: "Clear Selected", 
              onPress: () => {
                setAvatar("none"); 
                setAvatarURI("");
                resolve(null);
              }, style: "cancel" },
            { text: "Cancel", onPress: () => resolve(null), style: "cancel" },
          ]
        );
      });
    
      if (!choice) return;
    
      let result;
      if (choice === "camera") {
        result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
        });
      }
    
      if (!result.canceled) {
        const processedUri = await processImage(result.assets[0].uri);
        setAvatarURI(processedUri);
        setAvatar(processedUri);
      }
    };

    const processImage = async (uri) => {
        try {
          // 1. Check initial file size
          const fileInfo = await FileSystem.getInfoAsync(uri, { size: true });
          if (fileInfo.size && fileInfo.size > MAX_FILE_SIZE) {
            // 2. Calculate required compression ratio
            const quality = Math.min(0.8, MAX_FILE_SIZE / fileInfo.size);
            // 3. Resize and compress image
            const processed = await manipulateAsync(
              uri,
              [{ resize: { width: 1024 } }],
              {
                compress: quality,
                format: SaveFormat.JPEG,
              }
            );
            // 4. Verify final size
            const finalInfo = await FileSystem.getInfoAsync(processed.uri, { size: true });
            if (finalInfo.size && finalInfo.size > MAX_FILE_SIZE) {
              throw new Error('Image still exceeds size limit after compression');
            }
            return processed.uri;
          }
      
          return uri;
        } catch (error) {
          console.error('Image processing failed:', error);
          throw error;
        }
      };

      const handleLogout = () => {
        logout();
        router.replace('/');
      }
 
  return (
    <ScrollView 
        style={styles.container}
        automaticallyAdjustKeyboardInsets={true}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
    >
      <Pressable 
        style={[styles.avatarButton]} 
        onPress={pickImage}
      >
        {avatarURI ? 
          <Image source={{ uri: avatarURI }} style={styles.avatar} /> 
        :
          <Ionicons name={'person-circle-outline'} size={100} color={'grey'} />
        }
      </Pressable>
      <Text style={styles.inputLabel}>Username</Text>
      <TextInput 
        style={styles.textInput} 
        onChangeText={(text) => setName(text)}
        value={name}
        returnKeyType="next"
        onSubmitEditing={() => machineRef.current?.focus()}
      />
      <Text style={styles.inputLabel}>Espresso Machine</Text>
      <TextInput 
        ref={machineRef}
        style={styles.textInput} 
        onChangeText={(text) => setMachine(text)}
        value={machine}
        autoCorrect={false}
        returnKeyType="next"
        onSubmitEditing={() => grinderRef.current?.focus()}
      />
      <Text style={styles.inputLabel}>Grinder</Text>
      <TextInput 
        ref={grinderRef}
        style={styles.textInput} 
        onChangeText={(text) => setGrinder(text)}
        value={grinder}
        returnKeyType="done"
      />
      <View style={styles.bottomContainer}>
      <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={{color: '#FD9C2C', fontWeight: 'bold'}}>Logout</Text>
        </Pressable>
        <Pressable style={styles.loginButton} onPress={handleChange}>
          <Text style={{color: 'white', fontWeight: 'bold'}}>Apply Changes</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 15,
    backgroundColor: 'white',
    borderTopColor: '#BBBBBB',
    borderTopWidth: 0.5
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold'
  },
  textInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: "lightgrey",
    fontSize: 16, 
    color: 'black',
    backgroundColor: 'white',
    marginBottom: 20,
    marginTop: 5
  },
  avatarButton: {
    width: 100,
    height: 100,
    borderRadius: "50%",
    marginHorizontal: 'auto',
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 15,
    width: '100%',
    gap: 5
  },
  loginButton: {
    backgroundColor: "#FD9C2C",
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#FD9C2C",
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
});

export default EditProfile;