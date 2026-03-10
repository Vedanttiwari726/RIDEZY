import { createContext, useState, useEffect } from "react";

export const CaptainDataContext = createContext();

const CaptainContext = ({ children }) => {

  const [captain, setCaptain] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /* LOAD CAPTAIN FROM LOCAL STORAGE SAFELY */
  useEffect(() => {

    try {

      const storedCaptain = localStorage.getItem("captain");

      if (storedCaptain && storedCaptain !== "undefined") {
        const parsedCaptain = JSON.parse(storedCaptain);
        setCaptain(parsedCaptain);
      }

    } catch (err) {

      console.log("Captain parse error:", err);
      localStorage.removeItem("captain");

    }

    setIsLoading(false);

  }, []);

  /* SAVE CAPTAIN WHEN UPDATED */
  useEffect(() => {

    if (captain) {
      localStorage.setItem("captain", JSON.stringify(captain));
    }

  }, [captain]);

  return (
    <CaptainDataContext.Provider
      value={{
        captain,
        setCaptain,
        isLoading,
        setIsLoading,
        error,
        setError
      }}
    >
      {children}
    </CaptainDataContext.Provider>
  );
};

export default CaptainContext;