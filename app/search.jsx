import React, { useEffect, useState } from 'react';
import { Keyboard, View, StyleSheet, FlatList, Text, Pressable, TextInput, Image } from 'react-native';
import { usePocket } from '@/context/pocketbase';
import Ionicons from '@expo/vector-icons/Ionicons';

const Search = () => {  

    const { 
        fetchUsers,
        follow,
        unfollow,
        user
      } = usePocket();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (val) => {
        const res = await fetchUsers(val);
        console.log(res);
        setUsers(res);
    }

    return (
    <View style={styles.container}>
        <TextInput 
            style={styles.textInput} 
            placeholder='search for people'
            placeholderTextColor="gray"
            onChangeText={(text) => handleSearch(text)}
            returnKeyType='search'
        />
        <FlatList 
        contentContainerStyle={{ paddingBottom: 5 }}
            data = {users}
        renderItem={({item}) => (
            <View style={styles.userContainer}>
                <Image style={styles.avatar} source={{ uri: process.env.EXPO_PUBLIC_PB_URI + '/api/files/users/' + item.id + '/' + item.avatar }} />
                <Text style={{fontSize: 16}}>{item.name}</Text>
                {user.following.includes(item.id) ? 
                <Pressable 
                style={styles.unfollowButton}
                onPress={async () => unfollow(item.id)}
                >
                    <Text style={{color: '#FD9C2C', fontWeight: '500'}}>Unfollow</Text>
                </Pressable>
                :
                <Pressable 
                    style={styles.followButton}
                    onPress={async () => follow(item.id)}
                >
                    <Text style={{color: 'white'}}>Follow</Text>
                </Pressable>
                }
            </View>
        )}
        />

        <View style={styles.bottomContainer}>
        <Pressable 
            style={styles.bottomButton}
        >
            <Text style={{color: 'white', fontSize: 18, fontWeight: '400'}}>
                Invite friends to coffee time
            </Text>
            <Ionicons name='share-outline' size={20} color='white' />
        </Pressable>
        </View>
    </View>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 0,
    backgroundColor: 'white',
    borderTopColor: '#BBBBBB',
    borderTopWidth: 0.5
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
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15
  },  
  avatar: {
    width: 50,
    height: 50,
    backgroundColor: 'grey',
    borderRadius: '50%',
    marginRight: 15
  },
  followButton: {
    marginLeft: 'auto',
    backgroundColor: '#FD9C2C',
    padding: 10,
    borderRadius: 8
  },
  unfollowButton: {
    marginLeft: 'auto',
    borderWidth: 1,
    borderColor: '#FD9C2C',
    padding: 10,
    borderRadius: 8
  },
  bottomContainer: {
    paddingBottom: 30,
    paddingTop: 10,
    alignItems: 'center',
    width: '100%',
    borderTopColor: 'lightgrey',
    borderTopWidth: 1
  },
  bottomButton: {
    backgroundColor: '#FD9C2C',
    width: '90%',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5
  }
});

export default Search;