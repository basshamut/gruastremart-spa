import { useEffect, useState } from "react";
import { supabase } from "../config/supabase/supabaseClient";
import AuthContext from "./AuthContext";
import Spinner from "./Spinner";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1) Comprobamos si ya hay una sesión activa
        supabase.auth.getSession().then(({ data }) => {
            setUser(data?.session?.user ?? null);
            setLoading(false);
        });

        // 2) Escuchamos cambios de autenticación (login, logout, etc.)
        const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setUser(session?.user ?? null);
        
            if (session) {
                localStorage.setItem("jwt", session.access_token);
            } else {
                localStorage.removeItem("jwt");
            }
        
            setLoading(false);
        });

        // Limpieza del listener al desmontar
        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    // Funciones de ayuda
    const signUp = async (email, password) => {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        return data;
    };

    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        return data;
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        window.location.href = "/";
    };

    const isSessionActive = () => {
        return user !== null;
    };

    const value = {
        user,
        signUp,
        signIn,
        signOut,
        loading,
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? <Spinner/> : children}
        </AuthContext.Provider>
    );
}
