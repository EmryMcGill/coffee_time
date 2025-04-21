import React, { createContext, useContext, useEffect, useState } from "react";
import PocketBase, { AsyncAuthStore } from "pocketbase";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Create the context with an explicit type
const PbContext = createContext();

export const PbProvider = ({ children }) => {
  const [pb, setPb] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  

  // Initialize PocketBase
  useEffect(() => {
    const initializePocketBase = async () => {
      const store = new AsyncAuthStore({
        save: async (serialized) => AsyncStorage.setItem("pb_auth", serialized),
        initial: await AsyncStorage.getItem("pb_auth"),
        clear: async () => AsyncStorage.removeItem("pb_auth"),
      });

      const pbInstance = new PocketBase(process.env.EXPO_PUBLIC_PB_URI, store);
      setPb(pbInstance);
    };

    initializePocketBase();
  }, []);


  // Check authentication status
  useEffect(() => {
    const checkAuthStatus = async () => {
      // check that pb instance is defined
      if (!pb) return;
      
      // check if user is logged in
      const isUserLoggedIn = pb.authStore.isValid;
      setIsLoggedIn(isUserLoggedIn);
      setUser(isUserLoggedIn ? (pb.authStore.record) : null);
    }

    const tryRefreshToken = async () => {
      // check if pb instance is defined, and that user is valid
      if (!pb) return;
      if (!pb.authStore.isValid) return;

      // try to refresh the token
      try {
        await pb.collection('users').authRefresh();
        console.log("Token refreshed");
      } catch (err) {
        console.error("Failed to refresh token:", err);
        pb.authStore.clear();
        checkAuthStatus();
      }
    }

    // Initial check when component mounts
    checkAuthStatus();
    tryRefreshToken();

    // Listen for changes in authentication status
    if (pb) {
      const unsubscribe = pb.authStore.onChange(() => {
        checkAuthStatus();
      });

      // Cleanup listener on unmount
      return () => unsubscribe();
    }
  }, [pb]);

  // login
  const login = async (email, password) => {
    try {
      await pb.collection("users").authWithPassword(email, password);
      return 200;
    }
    catch (err) {
        console.log("failed to login: ", JSON.stringify(err, null, 2));
        return 400;
    }
  }

  // sign up
  const signup = async (name, email, password, confirmPass, avatar) => {
    // Read the file into a blob
    let fileBlob;
    if (avatar !== '') {
      fileBlob = {
        uri:  avatar,
        type: 'image/*',
        name: avatar.split('/').pop(),
      };
    }
    else {
      fileBlob = null;
    }

    const data = {
      "password": password,
      "passwordConfirm": confirmPass,
      "email": email,
      "name": name,
      "avatar": fileBlob
    };

    try {
      await pb.collection("users").create(data);
      await await pb.collection("users").authWithPassword(email, password);
      return 200;
    }
    catch (err) {
        console.log("failed to sign up: ", JSON.stringify(err, null, 2));
        return 400;
    }
  }

  const editProfile = async (name, machine, grinder, avatar) => {
    // Read the file into a blob
    let fileBlob;
    let data = {};
    if (avatar !== '') {
      fileBlob = {
        uri:  avatar,
        type: 'image/*',
        name: avatar.split('/').pop(),
      };
      data = {
        "avatar": fileBlob,
        "name": name,
        "machine": machine,
        "grinder": grinder
      };
    }
    else {
      fileBlob = null;
      data = {
        "name": name,
        "machine": machine,
        "grinder": grinder
      };
    }
  
  try {
    await pb.collection('users').update(user.id, data);
    return 200;
  }
  catch (err) {
      console.log("failed to edit profile: ", JSON.stringify(err, null, 2));
      return 400;
  }
  }

  // logout
  const logout = () => {
    pb.authStore.clear();
  }

  // get avatar
  const getAvatar = async (id) => {
    try {
      const user = await pb.collection("users").getOne(id);
      return user.avatar;
    }
    catch (err) {
      console.log("failed to get avatar", JSON.stringify(err, null, 2));
      return [];
    }
  }

  // ---- USERS ----

  const fetchUsers = async (val) => {
    if (val === '') {
      return [];
    }

    try {
      const res = await pb.collection("users").getList(1, 50, {
        filter: `name ~ "%${val}%"`,
      });
      const res_fil = res.items.filter(item => item.name !== user.name);
      return res_fil;
    }
    catch (err) {
      console.log("failed to load drinks from pb", JSON.stringify(err, null, 2));
      return [];
    }
  }

  const fetchUser = async (id) => {
    try {
      const res = await pb.collection("users").getOne(id);
      return res;
    }
    catch (err) {
      console.log("failed to fetch user pb", JSON.stringify(err, null, 2));
      return null;
    }
    
  }

  const follow = async (id) => {

    const new_following = [...user.following, id];
    console.log("new following", new_following);
    try {
      await pb.collection('users').update(user.id, {"following": new_following});
      return 200;
    }
    catch (err) {
        console.log("failed to edit profile: ", JSON.stringify(err, null, 2));
        return 400;
    }
  }

  const unfollow = async (id) => {

    console.log("old following, id", user.following, id);

    const new_following = user.following.filter(item => item !== id);
    console.log("new following", new_following);
    try {
      await pb.collection('users').update(user.id, {"following": new_following});
      return 200;
    }
    catch (err) {
        console.log("failed to edit profile: ", JSON.stringify(err, null, 2));
        return 400;
    }
  }

  // ---- DRINKS --------

  // load drinks
  const fetchDrinksPb = async () => {
    const user_filter = [...user.following, user.id];
    console.log('fil', user_filter)
    const filter = user_filter.map(id => `user="${id}"`).join(' || ');
    try {
      const res = await pb.collection("drinks").getList(1, 50, {
        filter: filter,
        sort: '-created'
    });
      return res;
    }
    catch (err) {
      console.log("failed to load drinks from pb", JSON.stringify(err, null, 2));
      return [];
    }
  }

  // save drink
  const saveDrinkPb = async (title, beans, doseWeight, yieldWeight, grindSize, brewTime, notes, image) => {
    // Read the file into a blob
    let fileBlob;
    if (image !== '') {
      fileBlob = {
        uri:  image,
        type: 'image/*',
        name: image.split('/').pop(),
      };
    }
    else {
      fileBlob = null;
    }

    // get the avatar url
    const url = pb.files.getURL(user, user.avatar);
    
    // Prepare the form data
    const formData = new FormData();
    formData.append('title', title);
    formData.append('beans', beans);
    formData.append('doseWeight', doseWeight);
    formData.append('yieldWeight', yieldWeight);
    formData.append('grindSize', grindSize);
    formData.append('brewTime', brewTime);
    formData.append('notes', notes);
    formData.append('user', user?.id);
    fileBlob ? formData.append('image', fileBlob) : '';
    formData.append('name', user?.name);
    formData.append('avatarURL', url);
    
    try {
      await pb.collection("drinks").create(formData);
    }
    catch (err) {
      console.log("failed to save drink: ", JSON.stringify(err, null, 2));
    }
  }

  const deleteDrinkPb = async (id) => {
    try {
      await pb.collection("drinks").delete(id);
    }
    catch (err) {
      console.log("failed to delete drink ", err);
    }
  }

  return (
    <PbContext.Provider value={{ 
      pb, 
      user, 
      isLoggedIn,
      login,
      signup,
      editProfile,
      logout,
      saveDrinkPb,
      fetchDrinksPb,
      deleteDrinkPb,
      getAvatar,
      fetchUsers,
      fetchUser,
      follow,
      unfollow
    }}>
      {children}
    </PbContext.Provider>
  );
};

// Custom hook to use PocketBase context safely
export const usePocket = () => useContext(PbContext);