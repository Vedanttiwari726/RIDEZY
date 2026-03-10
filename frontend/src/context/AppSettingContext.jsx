import React,
{
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

export const AppSettingsContext = createContext();

export const AppSettingsProvider = ({ children }) => {

  /* ================= THEME ================= */
  const [darkMode,setDarkMode]=useState(
    localStorage.getItem("darkMode")==="true"
  );

  /* ================= LANGUAGE ================= */
  const [language,setLanguage]=useState(
    localStorage.getItem("language") || "en"
  );


  /* ✅ APPLY DARK MODE TO HTML */
  useEffect(()=>{

    const root=document.documentElement;

    if(darkMode){
      root.classList.add("dark");
    }else{
      root.classList.remove("dark");
    }

    localStorage.setItem("darkMode",darkMode);

  },[darkMode]);


  /* ✅ SAVE LANGUAGE */
  useEffect(()=>{
    localStorage.setItem("language",language);
  },[language]);


  return(
    <AppSettingsContext.Provider
      value={{
        darkMode,
        setDarkMode,
        language,
        setLanguage
      }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
};


/* EASY HOOK */
export const useAppSettings=()=>{
  return useContext(AppSettingsContext);
};