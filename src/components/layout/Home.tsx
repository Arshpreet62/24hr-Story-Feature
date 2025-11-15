import React, { useEffect, useRef } from "react";
import { useState } from "react";
import { CiCirclePlus } from "react-icons/ci";

export default function Home() {
  type Story = {
    data: string;
    createdAt: number;
  };
  const [stories, setStories] = useState<Story[]>([]);

  const fileInputRef = useRef(null);
  useEffect(() => {
    const storiesStr = localStorage.getItem("stories");
    if (!storiesStr) return;

    try {
      const saved: Story[] = JSON.parse(storiesStr);
      const now = Date.now();
      const filtered = saved.filter(
        (s) => now - s.createdAt < 24 * 60 * 60 * 1000
      );
      setStories(filtered);
      localStorage.setItem("stories", JSON.stringify(filtered));
    } catch (e) {
      console.error("Failed to parse stories from localStorage", e);
      localStorage.removeItem("stories");
    }
  }, []);

  const handleIconClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      console.log("Selected file:", file);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        const base64data = {
          data: reader.result as string,
          createdAt: Date.now(),
        };
        console.log("base64data:", base64data);
        const newstories = [...stories, base64data];
        console.log("story:", newstories);
        setStories(newstories);
        localStorage.setItem("stories", JSON.stringify(newstories));
      };
    }
  };

  return (
    <div className="flex flex-col  bg-gray-100 items-center justify-start min-h-screen w-screen">
      <h1 className="text-3xl font-bold text-center text-gray-800">
        24 Hour Story Feature
      </h1>
      {
        <div className="flex flex-row border-2 border-black h-15 w-120 items-center justify-start px-1">
          <input
            type="file"
            accept=".jpg, .jpeg"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }} // hide input
          />
          <CiCirclePlus
            onClick={handleIconClick}
            className="w-12 h-12 text-gray-800 cursor-pointer"
          />

          {stories &&
            stories.map((story, index) => (
              <div
                key={index}
                className="justify-center items-center w-10 h-10 object-fill rounded-full overflow-hidden border-2 border-black "
              >
                {typeof story.data === "string" && (
                  <img src={story.data} alt="story" />
                )}
              </div>
            ))}
        </div>
      }
    </div>
  );
}
