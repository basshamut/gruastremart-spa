import { useContext } from "react";
import AuthContext from "../../components/access/AuthContext.jsx";

export function useAuth() {
    return useContext(AuthContext);
}
