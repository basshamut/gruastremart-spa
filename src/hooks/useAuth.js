import { useContext } from "react";
import AuthContext from "../components/access/AuthContext";

export function useAuth() {
    return useContext(AuthContext);
}
