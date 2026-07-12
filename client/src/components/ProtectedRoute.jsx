import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore.js";
export function ProtectedRoute({ children }) { const token = useAuthStore((state) => state.token); const location = useLocation(); return token ? children : <Navigate to="/login" replace state={{ from: location.pathname }} />; }
