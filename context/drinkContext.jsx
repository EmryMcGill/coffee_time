import React, { createContext, useContext, useEffect, useState } from "react";
import { useSQLiteContext } from 'expo-sqlite';
import { usePocket } from '@/context/pocketbase';

// Create the context with an explicit type
const DrinkContext = createContext();

export function DrinkProvider ({ children }) {
  const db = useSQLiteContext();
  const { 
    isLoggedIn, 
    fetchDrinksPb,
    saveDrinkPb,
    deleteDrinkPb,
    user
  } = usePocket();

  const [drinks, setDrinks] = useState([]);

  // fetch drinks on initial load, and whenever the auth state changes
  useEffect(() => {
    fetchDrinks();
  }, [isLoggedIn, user]);

  // function to fetch the drinks
  // return: null
  const fetchDrinks = async () => {
    if (isLoggedIn) {
      // sync local drinks
      // get the local drinks
      const res = await db.getAllAsync("SELECT * FROM drinks");
      // save them to pocketbase
      for (let i = 0; i < res.length; i++) {
        await saveDrink(
          res[i].title, 
          res[i].beans, 
          res[i].doseWeight, 
          res[i].yieldWeight, 
          res[i].grindSize, 
          res[i].brewTime, 
          res[i].notes, 
          res[i].image,
        )
      }
      // delete them locally
      await db.execAsync("DELETE FROM drinks");

      // fetch drinks from pocketbase
      const res2 = await fetchDrinksPb();
      setDrinks(res2.items);
    }
    else {
      // fetch drinks from sqlite
      const res = await db.getAllAsync("SELECT * FROM drinks");
      setDrinks(res);
    }
  }

  // function to save a new drink
  // return: null
  const saveDrink = async (drinkType, beans, inWeight, outWeight, grindSize, time, notes, image) => {
    if (isLoggedIn) {
      // save directly to pocketbase
      await saveDrinkPb(
        drinkType,
        beans,
        inWeight,
        outWeight,
        grindSize,
        time,
        notes,
        image
      );
    }
    else {
      // save to sqlite
      // get the current date time
      const currentDate = new Date();  
      try {
        await db.runAsync(
            "INSERT INTO drinks (title, beans, doseWeight, yieldWeight, grindSize, brewTime, image, notes, user, created) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);",
            [
                drinkType,
                beans,
                inWeight,
                outWeight,
                grindSize,
                time,
                image,
                notes,
                'guest',
                currentDate.toISOString()
            ]
        );
      } 
      catch (error) {
        console.error("Error saving drink locally:", error);
      }
    }

    // re-fetch drinks
    //await fetchDrinks();
  }

  // function to delete a drink
  // return: null
  const deleteDrink = async (id) => {
    if (isLoggedIn) {
      // delete from pb
      await deleteDrinkPb(id);
    }
    else {
      // delete from sqlite
      try {
        await db.runAsync("DELETE FROM drinks WHERE id = ?", [id]);      
      } catch (err) {
        console.log("Error deleting drink from local:", err);
      }
    }
  }

  return (
    <DrinkContext.Provider value={{ 
      drinks,
      saveDrink,
      deleteDrink,
      fetchDrinks
    }}>
      {children}
    </DrinkContext.Provider>
  );
};

// Custom hook to use PocketBase context safely
export const useDrinkContext = () => useContext(DrinkContext);