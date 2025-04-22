import React, { useState } from 'react';
import { 
  Text, 
  StyleSheet, 
  Pressable, 
  TextInput, 
  ScrollView
} from 'react-native';
import { usePocket } from '@/context/pocketbase';
import { useRouter } from "expo-router";


const Login = () => {

  // hooks
  const router = useRouter();
  const passwordInputRef = React.useRef<TextInput>(null);

  const { login } = usePocket();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
  
    const handleLogin = async () => {
      // try to login the user
      setLoading(true);
      const status = await login(email, password);
      setLoading(false);
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
      <Text style={styles.inputLabel}>Email</Text>
      <TextInput 
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
        returnKeyType="done"
      />
      <Pressable style={styles.loginButton} onPress={handleLogin}>
        <Text style={{color: 'white', fontWeight: 'bold'}}>{loading ? 'loading...' : 'Login'}</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
  loginButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: 'center'
  },
});

export default Login;