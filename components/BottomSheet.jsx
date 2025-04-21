import Ionicons from '@expo/vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import { 
    Modal, 
    StyleSheet, 
    View, 
    Pressable, 
    Text,
    FlatList,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Button,
    ScrollView
} from 'react-native';
import * as SQLite from 'expo-sqlite';

export default function BottomSheet({ 
    items, 
    modalVisible, 
    setModalVisible,
    value,
    setValue,
    label,
    type,
    searchFun,
    fil,
    saveType,
    isTimer,
    handleDeleteOption
}) {
    // hooks
    const db = SQLite.useSQLiteContext();

    // local data
    const [time, setTime] = useState(0);
    const [running, setRunning] = useState(false);

    // functions

    const closeModal = () => {
        if (searchFun !== undefined) {
            searchFun('');
        }
        setModalVisible(false);
    }

    useEffect(() => {
        let interval = null;

        if (running) {
            interval = setInterval(() => {
                setValue(String(Number(value) + 1));
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [value, running]);

  return (
    <>
    <View style={[styles.overlay, !modalVisible ? {display: 'none'} : '']}>
    </View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}>
            <Pressable 
                style={{flex: 1}}
                onPress={closeModal}
            ></Pressable>
            <KeyboardAvoidingView 
                            style={styles.modalView}
                            behavior='padding'
                            keyboardVerticalOffset={0}
                        >
                <View style={styles.topContainer}>
                    <Text style={styles.title}>{label}</Text>
                    <Pressable 
                        style={styles.closeButton}
                        onPress={closeModal}
                    >
                        <Ionicons name="close-outline" size={24} /> 
                    </Pressable>
                </View>
                {type === 'select' ?
                <>
                            <TextInput 
                                style={styles.textInput} 
                                placeholder='search or add ...'
                                placeholderTextColor="gray"
                                onChangeText={(text) => searchFun(text)}
                            />

                        {items.length > 0 ?
                        <FlatList
                            style={styles.itemList}
                            data={items}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item }) => (
                                <Pressable
                                    style={[styles.itemButton, value === item ? {borderColor: "#007AFF"} : '']}
                                    onPress={() => {
                                        setValue(item);
                                        closeModal();
                                    }}
                                    onLongPress={() => handleDeleteOption(item)}
                                >
                                    <Text style={[styles.text, value === item ? {color: "#007AFF"} : '']}>{item}</Text>
                                    {value === item ? <Ionicons name="checkmark-outline" size={24} color="#007AFF" /> : '' }
                                </Pressable>
                            )}
                        />
                        : fil.length > 0 ?
                        <Pressable
                            style={[styles.itemButtonNew]}
                            onPress={() => {
                                saveType(fil);
                                setValue(fil);
                                closeModal();
                            }}>
                            <Text style={[styles.text]}>{fil}</Text>
                        </Pressable>
                        :
                        <Text style={[styles.text, {width: "100%", textAlign: "center", paddingTop: 10}]}>no options yet, add some!</Text>
                        }
                                                </>

                : type === 'picker' ?
                <>
                    <Picker
                        selectedValue={value}
                        onValueChange={(itemValue, itemIndex) => setValue(itemValue)}
                        style={styles.picker}
                        itemStyle={styles.pickerItem}
                    >
                        {items.map((number) => (
                        <Picker.Item key={number} label={number.toString()} value={number.toString()} />
                        ))}
                    </Picker>
                    {isTimer ?
                    <View style={{marginBottom: 30}}> 
                        <Button title={running ? 'Stop' : 'Start'} onPress={() => setRunning(!running)} />
                    </View>
                        :
                        ''
                        }
                    </>
                    :
                    ''
                }
            </KeyboardAvoidingView>
        </Modal>
    </>
  );
}

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 5
    },
    modalView: {
      position: 'absolute',
      backgroundColor: "#fff",
      width: "100%",
      minHeight: "50%",
      bottom: 0,
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
      zIndex: 2,
      paddingBottom: 30,
      maxHeight: "85%"
    },
    topContainer: {
        flexDirection: "row",
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderColor: 'lightgrey'
    },
    title: {
        fontSize: 20,
        fontWeight: '500'
    },
    closeButton: {
        marginLeft: 'auto'
    },
    itemList: {
        padding: 15,
        paddingBottom: 50
    },
    text: {
        fontSize: 20
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
        marginHorizontal: 15,
        marginTop: 10
    },
    itemButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderRadius: 8,
        padding: 15,
        borderWidth: 1,
        borderColor: "lightgrey",
        marginBottom: 10
    },
    itemButtonNew: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderRadius: 8,
        padding: 15,
        borderWidth: 1,
        borderColor: "lightgrey",
        margin: 15
    },
    picker: {
        width: "100%",
        height: "100%",
        flex: 1
    },
    pickerItem: {
        color: 'black',
    }
  });