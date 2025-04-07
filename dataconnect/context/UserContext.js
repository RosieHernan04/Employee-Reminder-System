import { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase"; // Import Firebase instances

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null); // Initialize user as null
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setLoading(true);
        try {
          const userRole = await fetchUserRole(firebaseUser.uid);
          const userData = {
            name: firebaseUser.displayName || firebaseUser.email.split("@")[0],
            email: firebaseUser.email,
            role: userRole,
          };
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData)); // Persist user data
        } catch (error) {
          console.error("Error fetching user role:", error);
          setUser(null);
        }
      } else {
        localStorage.removeItem("user");
        setUser(null);
      }
      setLoading(false);
    });
  
    return () => unsubscribe();
  }, []);
  

  // Function to fetch user role from Firestore
  const fetchUserRole = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid)); // Assuming roles are stored in a "users" collection
      if (userDoc.exists()) {
        return userDoc.data().role; // Ensure the document has a "role" field
      } else {
        throw new Error("User role not found");
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
      throw error;
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}