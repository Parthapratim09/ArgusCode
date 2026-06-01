import { createContext,useContext,useState,useEffect } from "react";
import api from "../api/axios";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
           getUser()
        }else{
            setLoading(false);
        }
        }, []);

        async function getUser() {
            try{
                const response =await api.get("/auth/me");
                setUser(response.data);
            }
            catch (e){
                console.error("Failed to fetch user data:", e);
                localStorage.removeItem("token");  
                setUser(null); 
            }
            finally{
                setLoading(false);
            }
        }
    async function login (email, password) {
        const {data}=await api.post("/auth/login",{email,password});
        
        localStorage.setItem("token", data.token);
        
        const userData = data.user;
        localStorage.setItem("userId", userData.id);
        localStorage.setItem("userName", userData.name);
        localStorage.setItem("userRole", userData.role);
        setUser(userData);
    };

  

    async function logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("userName");
        localStorage.removeItem("userRole");
        setUser(null);
    }

    return(
        <AuthContext.Provider value={{user,login,getUser,logout}}>
            {!loading && children}
        </AuthContext.Provider>
    )
}
