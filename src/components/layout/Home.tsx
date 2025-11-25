import { useEffect, useRef } from "react";
import { useState } from "react";
import { CiCirclePlus } from "react-icons/ci";

export default function Home() {
  type Story = {
    data: string;
    createdAt: number;
  };
  const [stories, setStories] = useState<Story[]>([]);
  const [currentStory, setCurrentStory] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const minSwipeDistance = 50;
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].screenX;
    const distance = touchEndX.current - touchStartX.current;
    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        // swipe right -> previous story
        setCurrentStory((prev) =>
          prev !== null ? (prev - 1 ? prev - 1 : null) : null
        );
      } else if (distance < 0) {
        // swipe left -> next story
        setCurrentStory((prev) =>
          prev !== null ? (stories.length > prev + 1 ? prev + 1 : null) : null
        );
      }
    }
  };

  useEffect(() => {
    if (currentStory !== null) {
      setProgress(0);
      const startTime = Date.now();

      const updateProgress = () => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min((elapsed / 3000) * 100, 100);
        setProgress(newProgress);
        if (newProgress < 100) {
          requestAnimationFrame(updateProgress);
        }
      };

      updateProgress();
    }
  }, [currentStory]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (currentStory !== null && currentStory < stories.length - 1) {
      const timeoutId = setTimeout(() => {
        setCurrentStory((prev) => (prev === null ? null : prev + 1));
      }, 3000);
      return () => clearTimeout(timeoutId);
    } else if (currentStory === stories.length - 1) {
      // Optional: reset or pause at the last story
      const timeoutId = setTimeout(() => {
        setCurrentStory(null);
      }, 3000);
    }
  }, [currentStory, stories.length]);

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
      <h1 className="text-3xl font-bold text-center text-gray-800 ">
        24 Hour Story Feature
      </h1>
      {currentStory === null ? (
        <div className="flex flex-row border-2 border-black h-15 w-full max-w-120 items-center justify-start ">
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
                onClick={() => setCurrentStory(index)}
                className="justify-center items-center w-10 h-10 object-fill rounded-full overflow-hidden border-2 border-black "
              >
                {typeof story.data === "string" && (
                  <img src={story.data} alt="story" />
                )}
              </div>
            ))}
        </div>
      ) : (
        <div className="flex flex-col  h-100 w-full max-w-120 items-center justify-start ">
          <div className="flex  w-full h-5">
            {stories &&
              stories.map((story, index) => (
                <div
                  key={index}
                  className="flex-1 border-2 border-gray-600 bg-white"
                >
                  <div
                    style={
                      currentStory === index
                        ? { width: `${progress}%` }
                        : { width: "0%" }
                    }
                    className={`bg-linear-to-r from-[#c6ffdd] via-[#fbd786] to-[#f7797d] h-full  `}
                  ></div>
                </div>
              ))}
          </div>
          <div className="h-max w-full border-gray-600 border-2 overflow-hidden">
            <img
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
              src={stories[currentStory].data}
              alt="story"
            />
          </div>
        </div>
      )}
    </div>
  );
}
