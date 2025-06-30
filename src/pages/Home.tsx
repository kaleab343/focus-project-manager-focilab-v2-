import React, { useState, useEffect } from 'react';
import { Clock } from "@/components/layout/Clock";
import { Settings } from "@/components/shared/Settings";
import { HomeTodo } from "@/components/features/todo/HomeTodo";
import { WeeklyTodo } from "@/components/features/todo/WeeklyTodo";
import { Nav } from "@/components/layout/Nav";
import { useMainGoal } from '../context/MainGoalContext';
import { useTheme } from '../context/ThemeContext';
import { FocusOverlay } from "@/components/features/focus/FocusOverlay";

export const Home: React.FC = () => {
  const { mainGoal } = useMainGoal();
  const { theme } = useTheme();
  const [showOverlay, setShowOverlay] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [userVision, setUserVision] = useState<string>('');

  const [focusNote, setFocusNote] = useState<string | null>(null);
  const [focusMinutesSpent, setFocusMinutesSpent] = useState<number>(0);

  // Function to read a cookie value by name
  const getCookie = (name: string): string | null => {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  };

  // Get user name and vision from localStorage on component mount
  useEffect(() => {
    const storedUserName = localStorage.getItem('userName');
    const storedVision = localStorage.getItem('visionText');
    if (storedUserName) {
      setUserName(storedUserName);
    }
    if (storedVision) {
      setUserVision(storedVision);
    }
  }, []);

  // On mount and when overlay closes, read cookie values
  useEffect(() => {
    const note = getCookie('focusNote');
    if (note) {
      const splitIndex = note.indexOf(' - ');
      if (splitIndex !== -1 && splitIndex + 3 < note.length) {
        setFocusNote(note.substring(splitIndex + 3));
      } else {
        setFocusNote(note);
      }
    } else {
      setFocusNote(null);
    }

    const focusTimeStr = getCookie('focusTimeLeft');
    const focusTotalStr = getCookie('focusTotalTime');

    if (focusTimeStr && focusTotalStr) {
      const secondsLeft = parseInt(focusTimeStr);
      const totalSeconds = parseInt(focusTotalStr);
      if (!isNaN(secondsLeft) && !isNaN(totalSeconds) && totalSeconds > 0) {
        const minutesSpent = Math.round((totalSeconds - secondsLeft) / 60);
        setFocusMinutesSpent(minutesSpent > 0 ? minutesSpent : 0);
      } else {
        setFocusMinutesSpent(0);
      }
    } else {
      setFocusMinutesSpent(0);
    }
  }, [showOverlay]);

  const handleFocusClick = () => {
    setShowOverlay(true);
  };
  const handleCloseOverlay = () => {
    setShowOverlay(false);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] flex flex-col p-8 ">
      <div className="text-center py-4 flex justify-center">
        <div className="flex items-center gap-2">
          <img 
            src="/foci.svg" 
            alt="Foci" 
            className="w-6 h-6 inline-block self-center mt-[6px]"
            style={{
              filter: theme === 'dark' ? 'brightness(0) invert(1)' : 'none'
            }}
          />
          <span className="font-bold text-2xl font-['Kanit',_sans-serif] inline-flex items-center">
            {mainGoal || userVision || "Set your main goal"}
          </span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] gap-8 items-center my-8">
        <div className="absolute left-[3vw] top-[24vh] w-[30%]">
          <WeeklyTodo />
        </div>
        <Clock userName={userName} />
        <div className="absolute right-0 top-0 mx-[25px] mt-[24vh] w-[20%] flex flex-col items-start gap-4">
          <div className="flex flex-col gap-1">
            <button
              style={{ marginLeft: '20px', cursor: 'pointer' }}
              onClick={handleFocusClick}
              className="uppercase font-semibold px-4 py-1 border border-gray-400 rounded hover:bg-gray-700 hover:text-white transition cursor-pointer"
            >
              Focus
            </button>

            {/* Progress Bar under Focus button */}
            {focusMinutesSpent > 0 && (
              <div
                className="w-[150px] h-2 bg-gray-600 rounded overflow-hidden mt-1 ml-5"
                aria-label={`Focus progress: ${focusMinutesSpent} minutes`}
              >
                <div
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{ width: `${(focusMinutesSpent / 25) * 100}%` }}
                />
              </div>
            )}

            {/* Today Focus Note */}
            {focusNote && (
              <div
                className="text-white text-sm max-w-[200px] truncate ml-5"
                title={focusNote}
              >
                <strong>Today Focus:</strong> {focusNote}
              </div>
            )}

            {/* Minutes Focused */}
            {focusMinutesSpent > 0 && (
              <div className="text-white text-sm font-mono ml-5">
                ({focusMinutesSpent} min focused)
              </div>
            )}
          </div>

          <HomeTodo selectedDay={"Today"} />
        </div>
      </div>

      {/* Overlay Component */}
      {showOverlay && <FocusOverlay onClose={handleCloseOverlay} />}

      <Settings />
      <Nav />
    </div>
  );
};
