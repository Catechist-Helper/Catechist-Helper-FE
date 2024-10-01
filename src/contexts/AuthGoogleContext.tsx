import { useContext, createContext, useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { firebaseAuth } from "../config/firebaseConfig";

interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
}

interface AuthContextType {
  googleSignIn: () => void;
  logOut: () => void;
  user: User | null;
}

const AuthGoogleContext = createContext<AuthContextType | null>(null);

export const AuthContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);

  const googleSignIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(firebaseAuth, provider);
  };

  const logOut = () => {
    signOut(firebaseAuth);
  };

  useEffect(() => {
    const unSubscribe = onAuthStateChanged(
      firebaseAuth,
      (currentUser: User | null) => {
        setUser(currentUser);
      }
    );
    return () => {
      unSubscribe();
    };
  }, []);

  return (
    <AuthGoogleContext.Provider value={{ googleSignIn, logOut, user }}>
      {children}
    </AuthGoogleContext.Provider>
  );
};

export const useAuthGoogle = () => {
  const context = useContext(AuthGoogleContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthContextProvider");
  }
  return context;
};
