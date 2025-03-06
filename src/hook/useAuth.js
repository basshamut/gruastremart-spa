import { useContext } from "react";
import AuthContext from "../components/AuthContext.jsx";

export function useAuth() {
    return useContext(AuthContext);
}
