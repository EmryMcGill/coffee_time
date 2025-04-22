import React, { useState } from 'react';
import { 
  Text, 
  StyleSheet, 
  Pressable, 
  TextInput, 
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { usePocket } from '@/context/pocketbase';
import Ionicons from '@expo/vector-icons/Ionicons';

const Signup = () => {

  // hooks
  const router = useRouter();
  const emailInputRef = React.useRef<TextInput>(null);
  const passwordInputRef = React.useRef<TextInput>(null);
  const passwordConfInputRef = React.useRef<TextInput>(null);

  const { signup } = usePocket();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConf, setPasswordConf] = useState('');

  const handleSignup = async () => {
    console.log('signup')
    const status = await signup(name, email, password, passwordConf);

    // go to profile screen
    if (status === 200) {
      router.back();
    }
  }
 
  return (
    <ScrollView 
      style={styles.container}
      automaticallyAdjustKeyboardInsets={true}
    >
      <Text style={styles.inputLabel}>Username</Text>
      <TextInput 
        style={styles.textInput} 
        placeholder='username' 
        placeholderTextColor='grey' 
        onChangeText={(text) => setName(text)}
        returnKeyType="next"
        onSubmitEditing={() => emailInputRef.current?.focus()}
      />
      <Text style={styles.inputLabel}>Email</Text>
      <TextInput 
        ref={emailInputRef}
        style={styles.textInput} 
        placeholder='email' 
        placeholderTextColor='grey' 
        onChangeText={(text) => setEmail(text)}
        keyboardType="email-address"
        autoCorrect={false}
        autoCapitalize="none"
        textContentType="emailAddress"
        returnKeyType="next"
        onSubmitEditing={() => passwordInputRef.current?.focus()}
      />
      <Text style={styles.inputLabel}>Password</Text>
      <TextInput 
        ref={passwordInputRef}
        style={styles.textInput} 
        placeholder='password' 
        placeholderTextColor='grey' 
        onChangeText={(text) => setPassword(text)}
        secureTextEntry
        returnKeyType="next"
        onSubmitEditing={() => passwordConfInputRef.current?.focus()}
      />
      <Text style={styles.inputLabel}>Confirm Password</Text>
      <TextInput 
        ref={passwordConfInputRef}
        style={styles.textInput} 
        placeholder='password' 
        placeholderTextColor='grey' 
        onChangeText={(text) => setPasswordConf(text)}
        secureTextEntry
        returnKeyType="done"
      />
      <Pressable style={styles.loginButton} onPress={handleSignup}>
        <Text style={{color: 'white', fontWeight: 'bold'}}>Sign Up</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 0.5,
    borderTopColor: '#BBBBBB'
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
  loginButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: 'center'
  },
});

export default Signup;