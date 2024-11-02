import React from "react";
import Button from "../ui/button";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { authState } from "../../store/authState";
import { auth } from "../../firebase";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import Example from "./SliderToggle";
import { useTheme } from "../ThemeContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export default function Header() {
  const authStateValue = useRecoilValue(authState);
  const setAuthState = useSetRecoilState(authState);
  const provider = new GoogleAuthProvider();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();

      localStorage.setItem("token", token);

      // Immediately set the auth state after login
      setAuthState({
        isAuthenticated: true,
        user: {
          username: result.user.displayName,
          photoURL: result.user.photoURL,
          email: result.user.email,
          uid: result.user.uid,
        },
      });

      // Fetch token verification
      const response = await fetch(`${apiBaseUrl}/verifyToken`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Token verification failed");
      }

      navigate("/");
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("token");
      setAuthState({ isAuthenticated: false, user: null });
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      alert("Failed to log out. Please try again.");
    }
  };

  return (
    <header
      className={`${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      } transition-colors duration-200 border-b ${
        theme === "dark" ? "border-gray-800" : "border-gray-200"
      }`}
    >
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex-1 md:flex md:items-center md:gap-12">
            <Link
              to="/"
              className={`block ${
                theme === "dark" ? "text-white" : "text-teal-600"
              }`}
            >
              <span className="sr-only">Home</span>
              <svg
                className="h-8 w-8"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  className={`${
                    theme === "dark" ? "fill-white" : "fill-[#007DFC]"
                  }`}
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M25.5557 11.6853C23.9112 10.5865 21.9778 10 20 10V0C23.9556 0 27.8224 1.17298 31.1114 3.37061C34.4004 5.56823 36.9638 8.69181 38.4776 12.3463C39.9913 16.0008 40.3874 20.0222 39.6157 23.9018C38.844 27.7814 36.9392 31.3451 34.1421 34.1421C31.3451 36.9392 27.7814 38.844 23.9018 39.6157C20.0222 40.3874 16.0008 39.9913 12.3463 38.4776C8.69181 36.9638 5.56823 34.4004 3.37061 31.1114C1.17298 27.8224 0 23.9556 0 20H10C10 21.9778 10.5865 23.9112 11.6853 25.5557C12.7841 27.2002 14.3459 28.4819 16.1732 29.2388C18.0004 29.9957 20.0111 30.1937 21.9509 29.8078C23.8907 29.422 25.6725 28.4696 27.0711 27.0711C28.4696 25.6725 29.422 23.8907 29.8078 21.9509C30.1937 20.0111 29.9957 18.0004 29.2388 16.1732C28.4819 14.3459 27.2002 12.7841 25.5557 11.6853Z"
                />
                <path
                  className={`${
                    theme === "dark" ? "fill-white" : "fill-[#007DFC]"
                  }`}
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M10 5.16562e-07C10 1.31322 9.74135 2.61358 9.2388 3.82683C8.73625 5.04009 7.99966 6.14248 7.07107 7.07107C6.14249 7.99966 5.0401 8.73625 3.82684 9.2388C2.61358 9.74134 1.31322 10 5.4439e-06 10L5.00679e-06 20C2.62644 20 5.22716 19.4827 7.65368 18.4776C10.0802 17.4725 12.285 15.9993 14.1421 14.1421C15.9993 12.285 17.4725 10.0802 18.4776 7.65367C19.4827 5.22715 20 2.62643 20 -3.81469e-06L10 5.16562e-07Z"
                />
              </svg>
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <Example />
            {authStateValue.isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={authStateValue.user?.photoURL}
                        alt={authStateValue.user?.username}
                      />
                      <AvatarFallback>
                        {authStateValue.user?.username?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="ml-10 mt-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-lg"
                >
                  <DropdownMenuItem
                    asChild
                    className="hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Link
                      to="/"
                      className="block px-4 py-2 text-black dark:text-white"
                    >
                      Home
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Link
                      to="/create"
                      className="block px-4 py-2 text-black dark:text-white"
                    >
                      Create Post
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Link
                      to="/home"
                      className="block px-4 py-2 text-black dark:text-white"
                    >
                      Your Posts
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <span className="block px-2 pb-2 text-black dark:text-white">
                      Log Out
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={handleSignIn}
                className="h-11 flex items-center justify-center"
              >
                <span className="mt-1">Log In</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
