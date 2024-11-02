import { atom, selector } from "recoil";
import { auth } from "../firebase";

export const authState = atom({
  key: "authState",
  default: {
    isAuthenticated: false,
    user: null,
  },
});

export const initializeAuthState = selector({
  key: "initializeAuthState",
  get: async () => {
    return new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
          const token = await user.getIdToken(); // Get the token
          localStorage.setItem("token", token); // Store the token in local storage
          resolve({
            isAuthenticated: true,
            user: {
              username: user.displayName,
              photoURL: user.photoURL,
              email: user.email,
              uid: user.uid,
            },
          });
        } else {
          localStorage.removeItem("token"); // Clear the token if the user is logged out
          resolve({
            isAuthenticated: false,
            user: null,
          });
        }
        unsubscribe();
      });
    });
  },
});
