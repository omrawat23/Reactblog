import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { authState } from "../store/authState";
import useAuth from "../store/useAuth";
import Editor from "./ui/editor/Editor";
import Button from "./ui/button";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export default function EditPost() {
  const navigate = useNavigate();
  const { id } = useParams();
  const uid = useAuth();
  const { isAuthenticated, user } = useRecoilValue(authState);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState(null);
  const [redirect, setRedirect] = useState(false);
  const [redirectToHome, setRedirectToHome] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      const response = await fetch(`${apiBaseUrl}/post/${id}`, {
        method: "GET",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        // Handle error appropriately (e.g., redirect or show error message)
        return;
      }

      const postInfo = await response.json();
      setTitle(postInfo.title);
      setContent(postInfo.content);
      setSummary(postInfo.summary);
    };

    fetchPost();
  }, [id]);

  const updatePost = async (ev) => {
    ev.preventDefault();
    try {
      const data = new FormData();
      data.set("title", title);
      data.set("summary", summary);
      data.set("content", content);
      data.set("id", id);
      if (files?.[0]) {
        data.set("file", files[0]);
      }

      const response = await fetch(
        `${apiBaseUrl}/user/${user.uid}/post/${id}`,
        {
          method: "PUT",
          body: data,
          credentials: "include",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update post: ${response.statusText}`);
      }

      setRedirect(true);
    } catch (error) {
      console.error("Error updating post:", error);
      alert(
        "An error occurred while updating the post. Please try again later."
      );
    }
  };

  const deletePost = async () => {
    try {
      const response = await fetch(
        `${apiBaseUrl}/user/${user.uid}/post/${id}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete post");
      }

      setRedirectToHome(true);
    } catch (error) {
      console.error("Error deleting post:", error);
      alert(
        "An error occurred while deleting the post. Please try again later."
      );
    }
  };

  if (redirectToHome) {
    return <Navigate to="/home" />;
  }

  if (redirect) {
    return <Navigate to={`/post/${id}`} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center mt-[-64px]">
      <div className="relative bg-gray-800 bg-opacity-90 p-8 rounded-lg shadow-dark max-w-3xl w-full">
        <h1 className="text-3xl font-bold text-gray-100 mb-6">Edit Post</h1>
        <form onSubmit={updatePost} className="space-y-4">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(ev) => setTitle(ev.target.value)}
            className="w-full px-4 py-2 border border-gray-700 rounded-md bg-gray-900 text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-600"
          />
          <input
            type="text"
            placeholder="Summary"
            value={summary}
            onChange={(ev) => setSummary(ev.target.value)}
            className="w-full px-4 py-2 border border-gray-700 rounded-md bg-gray-900 text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-600"
          />
          <input
            type="file"
            onChange={(ev) => setFiles(ev.target.files)}
            className="w-full border border-gray-700 rounded-md bg-gray-900 text-gray-100 focus:outline-none"
          />
          <Editor value={content} onChange={setContent} />
          <div className="space-x-4">
            <Button
              type="submit"
              className="mt-5 bg-blue-600 text-white px-4 py-2 rounded"
            >
              Update Post
            </Button>
            <Button
              type="button"
              onClick={deletePost}
              className="mt-5 bg-red-600 text-white px-4 py-2 rounded"
            >
              Delete Post
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
