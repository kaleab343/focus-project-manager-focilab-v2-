import React from 'react';
import Clock from '../components/Clock';
import Settings from '../components/Settings';
import HomeTodo from '../components/HomeTodo';
import WeeklyTodo from '../components/WeeklyTodo';
import { useScore } from '../context/ScoreContext';
import { useTheme } from '../context/ThemeContext';

const Home: React.FC = () => {
  const { score } = useScore();
  const { theme } = useTheme();

  // Function to safely display the score regardless of its type
  const displayScore = () => {
    if (typeof score === 'number') {
      return score.toLocaleString();
    }
    return String(score);
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
          <span className="font-bold text-2xl font-['Kanit',_sans-serif] inline-flex items-center">{displayScore()}</span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] gap-8 items-center my-8">
        <div className="absolute left-[3vw] top-[24vh] w-[30%]">
          <WeeklyTodo />
        </div>
        <Clock />
        <div className="absolute right-0 top-0 mx-[25px] mt-[24vh] w-[20%]">
          <HomeTodo selectedDay={"Today"} />
        </div>
      </div>

      {/* <div className="flex justify-center items-center gap-4 py-4 text-[var(--text-secondary)]">
        <span className="cursor-pointer transition-colors hover:text-[var(--text-primary)]">Daily Planner</span>
        <span>|</span>
        <span className="cursor-pointer transition-colors hover:text-[var(--text-primary)]">Weekly</span>
        <span>|</span>
        <span className="cursor-pointer transition-colors hover:text-[var(--text-primary)]">Monthly</span>
      </div> */}

      <Settings />
    </div>
  );
};

export default Home; 