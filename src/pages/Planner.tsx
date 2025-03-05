import React, { useState } from 'react';
import DailyTodo from '../components/DailyTodo';
import WeeklyTodo from '../components/WeeklyTodo';
import Vision from '../components/Vision';
import YearlyGoals from '../components/YearlyGoals';
import QuarterlyGoals from '../components/QuarterlyGoals';

const Planner: React.FC = () => {
  const currentDate = new Date();
  const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });

  const weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  const currentDayIndex = currentDate.getDay();
  const adjustedIndex = currentDayIndex === 0 ? 6 : currentDayIndex - 1;

  const [selectedDay, setSelectedDay] = useState<string>(weekDays[adjustedIndex]);

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light">{dayName}</h1>
          <p className="text-sm text-gray-400 mt-1">Daily Planner</p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left Section - Week Selector and Daily Todo */}
          <div className="col-span-4 flex">
            {/* Week Selector */}
            <div className="mr-4">
              {weekDays.map((day, index) => (
                <div
                  key={day}
                  className={`flex items-center justify-center mb-3 cursor-pointer transform transition-transform duration-200 hover:scale-105 relative`}
                  onClick={() => setSelectedDay(day)}
                >
                  {index === adjustedIndex && <span className="absolute -left-4">{'>'}</span>}
                  <div className={`h-9 w-9 flex items-center justify-center rounded-sm text-sm ${
                    day === selectedDay ? 'bg-emerald-700' : 'bg-[#1A1F2E] border-[0.5px] border-gray-700 hover:border-emerald-600'
                  }`}>
                    {day}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Daily Todo */}
            <div className="flex-1">
              <DailyTodo selectedDay={selectedDay} />
            </div>
          </div>

          {/* Middle Section - Weekly Todo */}
          <div className="col-span-4">
            <WeeklyTodo />
          </div>

          {/* Right Section - Vision and Goals */}
          <div className="col-span-4 space-y-6">
            <Vision />
            <QuarterlyGoals />
            <YearlyGoals />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Planner;