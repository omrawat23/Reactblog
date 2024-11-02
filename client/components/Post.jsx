import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { Card, CardFooter, CardHeader } from "./ui/card";
import { CalendarIcon } from "lucide-react";
import Button from "./ui/button";

export default function PostCard({ _id, title, summary, cover, createdAt }) {
  const date = new Date(createdAt);

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg flex flex-col h-full">
      <Link to={`/post/${_id}`} className="block flex-shrink-0">
        <div className="relative" style={{ height: "400px" }}>
          <img
            src={cover}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      </Link>
      <CardHeader className="space-y-2 flex-grow">
        <Link to={`/post/${_id}`} className="block">
          <h2 className="text-2xl font-bold leading-tight text-primary hover:underline line-clamp-2">
            {title}
          </h2>
        </Link>
        <p className="line-clamp-3 text-muted-foreground">{summary}</p>
      </CardHeader>
      <CardFooter className="flex flex-col space-y-4 mt-auto">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center text-sm text-muted-foreground">
            <CalendarIcon className="mr-1 h-4 w-4" />
            {isNaN(date.getTime()) ? (
              <span>Invalid date</span>
            ) : (
              <time dateTime={createdAt}>
                {formatDistanceToNow(date, { addSuffix: true })}
              </time>
            )}
          </div>
          <Button>
            <Link to={`/post/${_id}`}>Read More</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
