import React from 'react';
import DailyTodo from '../components/DailyTodo';

const Planner: React.FC = () => {
  const currentDate = new Date();
  const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });

  const weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  const currentDayIndex = currentDate.getDay();
  const adjustedIndex = currentDayIndex === 0 ? 6 : currentDayIndex - 1;

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light">{dayName}</h1>
          <p className="text-sm text-gray-400 mt-1">Daily Planner</p>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Left Side - Days with Tasks */}
          <div className="col-span-3">
            {weekDays.map((day, index) => (
              <div
                key={day}
                className={`flex items-center mb-3 gap-4`}
              >
                <div className={`h-9 w-9 flex items-center justify-center rounded-sm text-sm ${
                  index === adjustedIndex ? 'bg-emerald-700' : 'bg-[#1A1F2E] border-[0.5px] border-gray-700'
                }`}>
                  {day}
                </div>
              </div>
            ))}
          </div>

          {/* Right Side - Daily Todo */}
          <div className="col-span-9">
            <DailyTodo />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Planner; 