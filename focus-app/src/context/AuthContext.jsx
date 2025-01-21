import { createContext, useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigation } from "../utils/navigation";
import NotAuthorized from "../utils/NotAuthorized";

const AuthContext = createContext("");

export default AuthContext;

export const AuthProvider = ({ children }) => {
  let [authTokens, setAuthTokens] = useState(() =>
    localStorage.getItem("authTokens")
      ? JSON.parse(localStorage.getItem("authTokens"))
      : null
  );
  let [user, setUser] = useState(() =>
    localStorage.getItem("authTokens")
      ? jwtDecode(localStorage.getItem("authTokens"))
      : null
  );
  let [isAuthorized, setIsAuthorized] = useState(null);

  const { toHome, toDrive } = useNavigation();

  let loginUser = async (email,password) => {
    let response = await fetch("http://127.0.0.1:8000/api/token/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        username: email,
        password: password,
      }),
    });
    let data = await response.json();

    if (response.status === 200) {
      setAuthTokens(data);
      setUser(jwtDecode(data.access));
      localStorage.setItem("authTokens", JSON.stringify(data));
      toDrive();
    } else {
      alert("Credentials do not match");
    }
  };

  let logoutUser = useCallback(() => {
    setAuthTokens(null);
    setUser(null);
    setIsAuthorized(false);
    localStorage.removeItem("authTokens");
    if (localStorage.getItem("calibration"))
    {
      localStorage.removeItem("calibration"); // Remove calibration data from localstorage, if exists
    }
    toHome();
  }, [setAuthTokens, setUser, setIsAuthorized, toHome]);

  let updateToken = useCallback(async () => {
    let response = await fetch("http://127.0.0.1:8000/api/token/refresh/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh: authTokens?.refresh }),
    });

    let data = await response.json();

    if (response.status === 200) {
      setAuthTokens(data);
      setUser(jwtDecode(data.access));
      localStorage.setItem("authTokens", JSON.stringify(data));
    } else {
      logoutUser();
    }
  }, [authTokens, setAuthTokens, setUser, logoutUser]);

  let contextData = {
    user: user,
    authTokens: authTokens,
    loginUser: loginUser,
    logoutUser: logoutUser,
  };

  useEffect(() => {
    if (isAuthorized) {
      const fourMinutes = 1000 * 60 * 4
      const interval = setInterval(() => {
        updateToken();
      }, fourMinutes);  

      return () => clearInterval(interval);
    }

  }, [updateToken, isAuthorized]);

  return (
    <AuthContext.Provider value={contextData}>
      {isAuthorized ? <NotAuthorized /> : children}
    </AuthContext.Provider>
  );
};