import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { formatISO9075 } from "date-fns";
import { useRecoilValue } from "recoil";
import { Pencil, Calendar, User, Share2 } from "lucide-react";
import { authState } from "../store/authState";
import Button from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export default function PostPage() {
  const [postInfo, setPostInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const { user } = useRecoilValue(authState);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        // Create headers object conditionally
        const headers = {};
        const token = localStorage.getItem("token");
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`${apiBaseUrl}/post/${id}`, {
          headers,
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch post");
        }
        const data = await response.json();
        setPostInfo(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleSharePost = () => {
    const shareLink = `${window.location.origin}/share/post/${id}`;
    alert(`Post shared! Link: ${shareLink}`);
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold mb-2">
            {postInfo.title}
          </CardTitle>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <time dateTime={postInfo.createdAt}>
                {formatISO9075(new Date(postInfo.createdAt))}
              </time>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Author: {postInfo.email || 'Unknown'}</span>
            </div>
          </div>
          {postInfo.summary && (
            <p className="text-lg text-muted-foreground mt-2">
              {postInfo.summary}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {postInfo.cover && (
            <img
              src={postInfo.cover}
              alt={postInfo.title}
              className="w-full h-64 object-cover rounded-lg mb-6"
            />
          )}
          <div
            className="prose prose-lg prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: postInfo.content }}
          />
          {user && (
            <div className="mt-6 flex flex-row justify-start space-x-4">
              <Link to={`/edit/${postInfo._id}`}>
                <Button variant="outline" className="flex items-center">
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit Post
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="flex items-center"
                onClick={handleSharePost}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Post
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}