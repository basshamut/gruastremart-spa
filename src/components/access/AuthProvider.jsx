import AuthContext from "./AuthContext";
import Spinner from "../common/Spinner";
import { useProvideAuth } from "../../hooks/auth/useProvideAuth";

export function AuthProvider({ children }) {
    const auth = useProvideAuth();

    return (
        <AuthContext.Provider value={auth}>
            {auth.loading ? <Spinner /> : children}
        </AuthContext.Provider>
    );
}
