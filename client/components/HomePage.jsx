import { useEffect, useState, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { useRecoilValue } from "recoil";
import { Loader2 } from "lucide-react";
import { authState } from "../store/authState";
import Post from "./Post";
import Button from "./ui/button";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export default function IndexPage() {
  const { user } = useRecoilValue(authState);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const { ref } = useInView();

  const fetchPosts = async () => {
    if (loading || !hasMore || !user) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found");

      const response = await fetch(`${apiBaseUrl}/user/${user.uid}/posts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Session expired. Please login again.");
        }
        throw new Error("Failed to fetch posts");
      }

      const newPosts = await response.json();
      setPosts((prevPosts) => {
        const uniqueNewPosts = newPosts.filter(
          (newPost) =>
            !prevPosts.some((prevPost) => prevPost._id === newPost._id)
        );
        return [...prevPosts, ...uniqueNewPosts];
      });
      setHasMore(newPosts.length > 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if user is available
    if (user) {
      fetchPosts();
    }
  }, [user]); // Added user as dependency

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Latest Blogs</h1>
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Post key={post._id} {...post} />
          ))}
        </div>
      ) : (
        !loading && (
          <p className="text-center text-gray-500 my-8">No posts available</p>
        )
      )}
      {loading && (
        <div className="flex justify-center my-8">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      )}
      {!loading && hasMore && (
        <div ref={ref} className="flex justify-center mt-8">
          <Button onClick={fetchPosts}>Load More</Button>
        </div>
      )}
      {!hasMore && posts.length > 0 && (
        <p className="text-center text-gray-500 mt-8">No more posts to load</p>
      )}
    </main>
  );
}
