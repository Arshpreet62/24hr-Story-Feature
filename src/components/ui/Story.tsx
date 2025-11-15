import React from "react";

export default function Story({ story }: { story: string }) {
  return (
    <div className="h-full w-full object-fill ">
      <img src={story} alt="story" />
    </div>
  );
}
