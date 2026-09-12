import { useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";

export default function RequireAuth({ children }) {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-400">
        Loading…
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
