import { Stack } from "expo-router";
import { SQLiteDatabase, SQLiteProvider } from "expo-sqlite";
import { StatusBar } from 'expo-status-bar';
import { PbProvider } from '@/context/pocketbase';
import { DrinkProvider } from '@/context/drinkContext';

export default function RootLayout() {
  const createTableIfNeeded = async (db: SQLiteDatabase) => {
    await db.execAsync(
      "CREATE TABLE IF NOT EXISTS drinks (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, beans TEXT, doseWeight TEXT, yieldWeight TEXT, grindSize TEXT, brewTime TEXT, image TEXT, notes TEXT, user TEXT, created TEXT);",
    );

    await db.execAsync(
      "CREATE TABLE IF NOT EXISTS drinkTypes (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT UNIQUE);"
    );

    await db.execAsync(
      "CREATE TABLE IF NOT EXISTS beanTypes (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT UNIQUE);"
    );

    await db.execAsync(
      "INSERT OR IGNORE INTO drinkTypes (title) VALUES ('Espresso'), ('Cortado'), ('Latte');"
    );
  }
  return (
        <SQLiteProvider 
          databaseName="test.db" 
          onInit={createTableIfNeeded}
        >
          <PbProvider>
            <DrinkProvider>
              <StatusBar style="dark" />
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen 
                  name="(auth)/login" 
                  options={{ 
                    title: "Login",
                    headerBackTitle: "Back",
                  }} />
                <Stack.Screen 
                  name="(auth)/signup" 
                  options={{ 
                    title: "Sign up",
                    headerBackTitle: "Back"
                  }}
                />
                <Stack.Screen 
                  name="(auth)/editProfile" 
                  options={{ 
                    title: "Edit Profile",
                    headerBackTitle: "Back"
                  }}
                />
                <Stack.Screen 
                  name="search" 
                  options={{ 
                    title: "Search",
                    headerBackTitle: "Back"
                  }}
                />
              </Stack>
            </DrinkProvider>
          </PbProvider>
        </SQLiteProvider>
  );
}
