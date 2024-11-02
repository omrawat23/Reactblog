import React from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { authState } from "../../store/authState";
import { auth } from "../../firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import Button from "./button";
import { Link, useNavigate } from "react-router-dom";
import blog from "../../src/assets/blog.gif";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export default function HeroSection() {
  const authStateValue = useRecoilValue(authState);
  const setAuthState = useSetRecoilState(authState);
  const provider = new GoogleAuthProvider();
  const navigate = useNavigate();

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

  return (
    <section className="mx-auto max-w-screen-xl px-4 sm:px-6 sm:mt-16 lg:px-8 py-12 md:py-24 lg:py-32 xl:py-48 bg-background">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Blog Your Way
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Craft your thoughts into blogs, manage your content
                effortlessly, update and share your blogs.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              {authStateValue.isAuthenticated ? (
                <>
                  <Link to="/create">
                    <Button size="lg">Create Post</Button>
                  </Link>
                  <Link to="/home">
                    <Button variant="outline" size="lg">
                      Your Posts
                    </Button>
                  </Link>
                </>
              ) : (
                <Button onClick={handleSignIn} size="lg">
                  Get Started
                </Button>
              )}
            </div>
          </div>
          <div className="flex items-center justify-center">
            <img src={blog} alt="Blog illustration" />
          </div>
        </div>
      </div>
    </section>
  );
}
