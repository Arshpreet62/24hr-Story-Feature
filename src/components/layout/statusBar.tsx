import React from "react";
import Story from "../ui/Story";

export default function statusBar({ story }: { story: string }) {
  return (
    <div>
      <Story story={story} />
    </div>
  );
}
