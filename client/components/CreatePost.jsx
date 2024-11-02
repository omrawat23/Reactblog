import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { authState, initializeAuthState } from "../store/authState";
import Editor from "./ui/editor/Editor";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export default function CreatePost() {
  const authStateValue = useRecoilValue(authState);
  const setAuthState = useSetRecoilState(authState);
  const { isAuthenticated, user } = useRecoilValue(authState);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState("");
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    // Optionally, you can initialize auth state here
    const initialize = async () => {
      // Call the selector to initialize the state (if needed)
      const authData = await initializeAuthState.get();
      setAuthState(authData);
    };
    initialize();
  }, []);

  async function createNewPost(ev) {
    ev.preventDefault();

    const data = new FormData();
    data.set("title", title);
    data.set("summary", summary);
    data.set("content", content);
    if (files.length > 0) {
      data.set("file", files[0]);
    }

    const response = await fetch(`${apiBaseUrl}/user/${user.uid}/post`, {
      method: "POST",
      body: data,
      credentials: "include",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`, // Use token from local storage
      },
    });

    if (response.ok) {
      setRedirect(true);
    }
  }

  if (redirect) {
    return <Navigate to="/home" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center mt-[-64px]">
      <div className="relative bg-gray-800 bg-opacity-90 p-8 rounded-lg shadow-dark max-w-3xl w-full">
        <h1 className="text-3xl font-bold text-gray-100 mb-6">
          Create New Post
        </h1>
        <form onSubmit={createNewPost} className="space-y-4">
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
          <button
            type="submit"
            className="w-full bg-gray-700 text-gray-100 py-2 px-4 rounded-md hover:bg-gray-600 transition duration-300 mt-4"
          >
            Create Post
          </button>
        </form>
      </div>
    </div>
  );
}
