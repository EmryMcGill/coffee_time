import { Stack, Link } from 'expo-router';
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from 'expo-router';
import { Modal, Keyboard, View, Text, StyleSheet, Pressable, ScrollView, Image, Button, Alert, TextInput, KeyboardAvoidingView } from "react-native";
import BottomSheet from "@/components/BottomSheet";
import InputButton from "@/components/InputButton";
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import * as SQLite from 'expo-sqlite';
import { useFocusEffect } from 'expo-router';
import { useDrinkContext } from '@/context/drinkContext';
import * as Haptics from 'expo-haptics';
import * as FileSystem from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { usePocket } from '@/context/pocketbase';

export default function CreateModal({modalVisible, setModalVisible}) {

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB


    // hooks
    const router = useRouter();
    const db = SQLite.useSQLiteContext();
    const { drinks, saveDrink, fetchDrinks } = useDrinkContext();
    const scrollViewRef = useRef();
    const { user } = usePocket();

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
          const processedUri = await processImage(result.assets[0].uri);
          setImage(processedUri);
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
        setLoading(true);
        await saveDrink(drinkType, beans, inWeight, outWeight, grindSize, time, notes, image);
        setLoading(false);
        // re-fetch drinks
        await fetchDrinks();

        handleClose();
    }

    const handleClose = () => {
        // get users drinks
        const drinks_filt = drinks?.items?.filter(item => item.user === user.id);

        if (drinks_filt?.length > 0) {
          setDrinkType(drinks_filt[0].title);
          setBeans(drinks_filt[0].beans);
          setInWeight(drinks_filt[0].doseWeight);
          setOutWeight(drinks_filt[0].yieldWeight);
          setGrindSize(drinks_filt[0].grindSize);
        }

        setNotes("");
        setImage("");

        setModalVisible(false);
    }

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
      // get users drinks
      const drinks_filt = drinks?.items?.filter(item => item.user === user.id);

      if (drinks_filt?.length > 0) {
        setDrinkType(drinks_filt[0].title);
        setBeans(drinks_filt[0].beans);
        setInWeight(drinks_filt[0].doseWeight);
        setOutWeight(drinks_filt[0].yieldWeight);
        setGrindSize(drinks_filt[0].grindSize);
      }
    }, [drinks]);

    return (
        <Modal
            visible={modalVisible}
            animationType="slide"
            transparent={false}
            presentationStyle='pageSheet'
            onRequestClose={handleClose}
        >
        <View 
          style={styles.container}
        >
        <View style={styles.header}>
        <View style={{ position: 'absolute', left: 5 }}>
    <Button 
      title="Cancel" 
      color="black" 
      onPress={handleClose} 
    />
  </View>
            <Text style={{fontSize: 16, fontWeight: 'bold'}}>Create New Drink</Text>
        </View>
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
          contentContainerStyle={{ paddingBottom: 100 }}
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
                { backgroundColor: pressed ? '#FD9C2C' : '#FD9C2C' },
                styles.doneButton
            ]} onPress={handleSaveDrink}>
            <Text style={styles.doneButtonText}>{loading ? "loading..." : "Create"}</Text>
          </Pressable>
          </ScrollView>
        </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: { 
      flexGrow: 1,
      backgroundColor: 'white',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderBottomColor: 'lightgrey',
        borderBottomWidth: 1
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