import { firebaseAuth } from "@/lib/firebase";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type AuthContextValue = {
  firebaseUser: FirebaseUser | null;
  firebaseLoading: boolean;
};

const AuthContext = createContext<AuthContextValue>({
  firebaseUser: null,
  firebaseLoading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [firebaseLoading, setFirebaseLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, user => {
      setFirebaseUser(user);
      setFirebaseLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ firebaseUser, firebaseLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useFirebaseAuth() {
  return useContext(AuthContext);
}
