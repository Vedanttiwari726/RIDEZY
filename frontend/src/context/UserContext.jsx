import React, { createContext, useEffect, useState } from "react";

export const UserDataContext = createContext();

const UserContext = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  const loginUser = (data, token) => {
    localStorage.setItem("user", JSON.stringify(data));
    localStorage.setItem("token", token);
    setUser(data);
  };

  const logoutUser = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <UserDataContext.Provider
      value={{
        user,
        setUser,
        loginUser,
        logoutUser,
        loading
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
};

export default UserContext;
