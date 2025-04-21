import { Stack, Link } from 'expo-router';
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from 'expo-router';
import { Keyboard, View, Text, StyleSheet, Pressable, ScrollView, Image, Button, Alert, TextInput, KeyboardAvoidingView } from "react-native";
import BottomSheet from "@/components/BottomSheet";
import InputButton from "@/components/InputButton";
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import * as SQLite from 'expo-sqlite';
import { useFocusEffect } from 'expo-router';
import { useDrinkContext } from '@/context/drinkContext';
import * as Haptics from 'expo-haptics';

export default function Create() {
  // hooks
  const router = useRouter();
  const db = SQLite.useSQLiteContext();
  const { drinks, saveDrink, fetchDrinks } = useDrinkContext();
  const scrollViewRef = useRef();

  // LOCAL DATA

  // modal toggles
  const [drinkTypeModal, setDrinkTypeModal] = useState(false);
  const [beansModal, setBeansModal] = useState(false);
  const [inWeightModal, setInWeightModal] = useState(false);
  const [grindSizeModal, setGrindSizeModal] = useState(false);
  const [outWeightModal, setOutWeightModal] = useState(false);
  const [timeModal, setTimeModal] = useState(false);
  // form data
  const [drinkType, setDrinkType] = useState('Espresso');
  const [beans, setBeans] = useState('');
  const [inWeight, setInWeight] = useState('18');
  const [grindSize, setGrindSize] = useState('12');
  const [outWeight, setOutWeight] = useState('36');
  const [time, setTime] = useState('0');
  const [image, setImage] = useState('');
  const [notes, setNotes] = useState('');
  // selection data
  const [drinkTypes, setDrinkTypes] = useState([]);
  const [beanTypes, setBeanTypes] = useState([]);
  const numArray = Array.from({ length: 100 }, (_, i) => (i).toString());
  const [drinkTypeFilter, setDrinkTypeFilter] = useState(''); 
  const [beanTypeFilter, setBeanTypeFilter] = useState(''); 
  // other data
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(false);

  // FUNCTIONS

  // to use the phones image picker
  const pickImage = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();

    const choice = await new Promise((resolve) => {
      Alert.alert(
        "Choose Image",
        "Would you like to take a new photo or select from the gallery?",
        [
          { text: "Camera", onPress: () => resolve("camera") },
          { text: "Gallery", onPress: () => resolve("gallery") },
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
      setImage(result.assets[0].uri);
    }
  };

  // create new drink type
  const saveDrinkType = async (title) => {
    try {
        await db.runAsync(
            "INSERT INTO drinkTypes (title) VALUES (?);",
            [
                title
            ]
        );
        setRefreshKey(!refreshKey);
      } 
      catch (error) {
        console.error("Error saving drink type:", error);
      }
  }

  const handleDeleteDrinkType = async (item) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Delete Drink Type',
      'Are you sure you want to delete ' + item + '?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await db.runAsync(
              "DELETE FROM drinkTypes WHERE title = ?;",
              [item]
            );
            setRefreshKey(!refreshKey);
          } catch (error) {
            console.error("Error deleting drink type:", error);
          }
        }},
      ],
      { cancelable: true }
    );
  }

  // create new drink type
  const saveBeanType = async (title) => {
    try {
        await db.runAsync(
            "INSERT INTO beanTypes (title) VALUES (?);",
            [
                title
            ]
        );
        setRefreshKey(!refreshKey);
      } 
      catch (error) {
        console.error("Error saving drink type:", error);
      }
  }

  const handleDeleteBeanType = async (item) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Delete Bean Type',
      'Are you sure you want to delete ' + item + '?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await db.runAsync(
              "DELETE FROM beanTypes WHERE title = ?;",
              [item]
            );
            setRefreshKey(!refreshKey);
          } catch (error) {
            console.error("Error deleting bean type:", error);
          }
        }},
      ],
      { cancelable: true }
    );
  }

  const handleSaveDrink = async () => {
    console.log("handle save drink")
    // save drink
    await saveDrink(drinkType, beans, inWeight, outWeight, grindSize, time, notes, image);

    // re-fetch drinks
    await fetchDrinks();

    // return to main page
    router.replace('/');
  }

  // EFFECTS

  // to fetch local data at load, and whenever the db changes
  useEffect(() => {
    const fetchLocalData = async () => {
      // fetch the drink types
      setDrinkTypes(await db.getAllAsync("SELECT * FROM drinkTypes"));
      // fetch the bean types
      setBeanTypes(await db.getAllAsync("SELECT * FROM beanTypes"));
    }
    fetchLocalData();
  }, [db, refreshKey]);

  // to set the default values for the form inputs
  useEffect(() => {
      if (drinks.items.length > 0) {
        setDrinkType(drinks.items[0].title);
        setBeans(drinks.items[0].beans);
        setInWeight(drinks.items[0].doseWeight);
        setOutWeight(drinks.items[0].yieldWeight);
        setGrindSize(drinks.items[0].grindSize);
      }
  }, [drinks]);

  useFocusEffect(
    useCallback(() => {
      if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ y: 0, animated: true });
      }
    }, []));

  return (
    <>
      <Stack.Screen 
          options={{
            headerLeft: () => (
              <View style={{ paddingLeft: 10 }}>
                <Button title="Cancel" color="black" onPress={() => router.push('/(tabs)')} />
              </View>
            ),
          }}
      />
        <View 
          style={styles.container}
        >
          <BottomSheet 
            items={drinkTypes.map((drinkType) => drinkType.title).filter((drinkType) => drinkType.toLowerCase().includes(drinkTypeFilter.toLowerCase()))} 
            modalVisible={drinkTypeModal}
            setModalVisible={setDrinkTypeModal}
            value={drinkType}
            setValue={setDrinkType}
            label="Drink Type"
            type="select"
            searchFun={(fil) => setDrinkTypeFilter(fil)}
            fil={drinkTypeFilter}
            saveType={saveDrinkType}
            handleDeleteOption={(item) => handleDeleteDrinkType(item)}
          />
          <BottomSheet 
            items={beanTypes.map((beanType) => beanType.title).filter((beanType) => beanType.toLowerCase().includes(beanTypeFilter.toLowerCase()))} 
            modalVisible={beansModal}
            setModalVisible={setBeansModal}
            value={beans}
            setValue={setBeans}
            label="Beans"
            type="select"
            searchFun={(fil) => setBeanTypeFilter(fil)}
            fil={beanTypeFilter}
            saveType={saveBeanType}
            handleDeleteOption={(item) => handleDeleteBeanType(item)}
          />
          <BottomSheet 
            items={numArray} 
            modalVisible={inWeightModal}
            setModalVisible={setInWeightModal}
            value={inWeight}
            setValue={setInWeight}
            label="Dose Weight (g)"
            type="picker"
          />
          <BottomSheet
            items={numArray}
            modalVisible={grindSizeModal}
            setModalVisible={setGrindSizeModal}
            value={grindSize}
            setValue={setGrindSize}
            label="Grind Size"
            type="picker"
          />
          <BottomSheet
            items={numArray}
            modalVisible={outWeightModal}
            setModalVisible={setOutWeightModal}
            value={outWeight}
            setValue={setOutWeight}
            label="Yield Weight (g)"
            type="picker"
          />
          <BottomSheet
            items={numArray}
            modalVisible={timeModal}
            setModalVisible={setTimeModal}
            value={time}
            setValue={setTime}
            label="Brew Time (s)"
            type="picker"
            isTimer={true}
          />

        <ScrollView 
          style={{padding: 15}}
          automaticallyAdjustKeyboardInsets={true}
          ref={scrollViewRef}
          contentContainerStyle={{ paddingBottom: 10 }}
        >

          <InputButton 
            label="Drink Type" 
            value={drinkType}
            handlePress={() => setDrinkTypeModal(true)}
          />
          <InputButton 
            label="Beans" 
            value={beans}
            handlePress={() => setBeansModal(true)}
          />
          <InputButton 
            label="Dose Weight" 
            value={inWeight + ' g'}
            handlePress={() => setInWeightModal(true)}
          />
          <InputButton 
            label="Grind Size" 
            value={grindSize}
            handlePress={() => setGrindSizeModal(true)}
          />
          <InputButton 
            label="Brew Time" 
            value={time + ' sec'} 
            handlePress={() => setTimeModal(true)} 
          />
          <InputButton 
            label="Yield Weight" 
            value={outWeight + ' g'} 
            handlePress={() => setOutWeightModal(true)} 
          />

          <View style={styles.photoContainer}>
            <Pressable 
              style={styles.photoButton}
              onPress={pickImage}
            >
              <Ionicons name="image-outline" size={24} />
              <Text style={{textAlign: 'center'}}>{image ? 'Choose a different photo' : 'Add a photo'}</Text>
            </Pressable>
            {image ? <Image source={{ uri: image }} style={styles.image} /> : ''}
          </View>

          <TextInput
            placeholder='add some notes...'
            placeholderTextColor="grey"
            style={styles.notes}
            multiline={true}
            numberOfLines={5}
            textAlignVertical="top"
            value={notes}
            onChangeText={(text) => {
              if (text.endsWith('\n')) {
                Keyboard.dismiss();
              } else {
                setNotes(text);
              }
            }}
          />

          <Pressable style={({ pressed }) => [
                { backgroundColor: pressed ? '#00B0FF' : '#007AFF' },
                styles.doneButton
            ]} onPress={handleSaveDrink}>
            <Text style={styles.doneButtonText}>{loading ? "loading..." : "Create"}</Text>
          </Pressable>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1,
    backgroundColor: 'white',
  },
  photoContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  photoButton: {
    borderWidth: 2,
    borderColor: 'lightgrey',
    borderStyle: 'dashed',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
    flex: 1,
    paddingHorizontal: 20
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 8
  },
  notes: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'lightgrey',
    borderRadius: 8,
    height: 120,
    padding: 15,
    fontSize: 18
  },
  doneButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  doneButtonText: {
    color: 'white',
    fontSize: 18,
  }
});