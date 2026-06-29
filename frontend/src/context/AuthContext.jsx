import {
    createContext,
    useContext,
    useEffect,
    useState,
  } from "react";
  
  const AuthContext = createContext();
  
  export const AuthProvider = ({ children }) => {
  
    const [user, setUser] = useState(null);
  
    useEffect(() => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser && storedUser !== "undefined") {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error("Failed to parse user:", err);
        localStorage.removeItem("user");
      }
    }, []);
  
    const login = (userData, token) => {
  
      localStorage.setItem("token", token);
  
      localStorage.setItem(
        "user",
        JSON.stringify(userData)
      );
  
      setUser(userData);
    };
  
    const logout = () => {
  
      localStorage.removeItem("token");
  
      localStorage.removeItem("user");
  
      setUser(null);
    };
  
    return (
      <AuthContext.Provider
        value={{
          user,
          login,
          logout,
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  };
  
  export const useAuth = () => {
    return useContext(AuthContext);
  };