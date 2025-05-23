import { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase"; // Import Firebase instances

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null); // Initialize user as null
  const [loading, setLoading] = useState(true); // Add loading state

  const fetchUserRole = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        console.log("Fetched user data from Firestore:", data);
        return data;
      }
      console.log("No user document found for uid:", uid);
      return null;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setLoading(true);
        try {
          const firestoreData = await fetchUserRole(firebaseUser.uid);
          console.log("Firestore data:", firestoreData);
          
          // Create user object with Firestore data taking precedence
          const user = {
            ...firestoreData, // Spread Firestore data first
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            // Ensure role and fullName are set from Firestore or fallback
            role: firestoreData?.role || 'employee',
            fullName: firestoreData?.fullName || firebaseUser.displayName || firebaseUser.email.split('@')[0]
          };
          
          console.log("Final user object:", user);
          setUser(user);
          localStorage.setItem("user", JSON.stringify(user));
        } catch (error) {
          console.error("Error setting up user:", error);
          const user = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: 'employee',
            fullName: firebaseUser.displayName || firebaseUser.email.split('@')[0]
          };
          setUser(user);
          localStorage.setItem("user", JSON.stringify(user));
        }
        setLoading(false);
      } else {
        localStorage.removeItem("user");
        setUser(null);
        setLoading(false);
      }
    });
  
    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}