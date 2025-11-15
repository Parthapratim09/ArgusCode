import { createContext,useContext,useState,useEffect } from "react";
import api from "../api/axios";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
           getUser()
            }
        }, []);

        async function getUser() {
            try{
                const response =api.get("/auth/me");
                setUser(response.data);
            }
            catch (e){
                console.error("Failed to fetch user data:", e);
                localStorage.removeItem("token");   
            }
        }
    async function login (email, password) {
        const {data}=await api.post("/auth/login",{email,password});
        
        localStorage.setItem("token", data.token);
        const userData = data.user;
        setUser(userData);
    };

  

    async function logout() {
        localStorage.removeItem("token");
        setUser(null);
    }

    return(
        <AuthContext.Provider value={{user,login,getUser,logout}}>
            {children}
        </AuthContext.Provider>
    )
}
