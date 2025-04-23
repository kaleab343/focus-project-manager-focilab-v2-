import React, { useState, useEffect } from 'react';
import { DndProvider, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DailyTodo  } from '@/components/features/todo/DailyTodo';
import { ItemTypes } from '@/components/features/todo/types';
import { WeeklyTodo } from '@/components/features/todo/WeeklyTodo';
import {Vision} from '@/components/features/goals/Vision';
import {YearlyGoals} from '@/components/features/goals/YearlyGoals';
import {QuarterlyGoals} from '@/components/features/goals/QuarterlyGoals';
import {Nav} from '@/components/layout/Nav';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  date: string;
}

export const Planner: React.FC = () => {
  const currentDate = new Date();
  const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });

  const weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  const currentDayIndex = currentDate.getDay();
  const adjustedIndex = currentDayIndex === 0 ? 6 : currentDayIndex - 1;

  const [selectedDay, setSelectedDay] = useState<string>(weekDays[adjustedIndex]);
  // Add a state to force re-renders when todos are moved
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Function to handle moving a todo to a different day
  const handleMoveTodo = (todo: Todo, targetDay: string) => {
    console.log(`Moving todo ${todo.id} to ${targetDay}`);
    
    // Get current todos from localStorage
    const storedTodos = localStorage.getItem('dailyTodos');
    if (!storedTodos) return;
    
    const todos: Todo[] = JSON.parse(storedTodos);
    
    // Find the todo to move
    const todoIndex = todos.findIndex(t => t.id === todo.id);
    if (todoIndex === -1) {
      console.error('Todo not found:', todo.id);
      return;
    }
    
    // Create a new todo with the updated date
    const updatedTodo = { ...todos[todoIndex], date: targetDay };
    
    // Update the todos array
    const updatedTodos = [...todos];
    updatedTodos[todoIndex] = updatedTodo;
    
    // Save back to localStorage
    localStorage.setItem('dailyTodos', JSON.stringify(updatedTodos));
    
    // Force a re-render
    setRefreshTrigger(prev => prev + 1);
  };

  // Refresh the component when refreshTrigger changes
  useEffect(() => {
    // This effect will run whenever refreshTrigger changes
    console.log('Refreshing component due to todo movement');
  }, [refreshTrigger]);

  // Droppable day component
  const DroppableDay: React.FC<{ day: string, isSelected: boolean, children?: React.ReactNode }> = ({ day, isSelected, children }) => {
    const [{ isOver }, drop] = useDrop({
      accept: ItemTypes.TODO,
      drop: (item: Todo) => {
        console.log('Dropped todo on day:', day, item);
        handleMoveTodo(item, day);
        return { name: day };
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    });

    return (
      <div 
        ref={drop as any} 
        className={`flex items-center justify-center mb-3 cursor-pointer transform transition-transform duration-200 hover:scale-105 relative ${
          isOver ? 'bg-emerald-900/50' : ''
        }`}
        onClick={() => setSelectedDay(day)}
      >
        {isSelected && <span className="absolute -left-4">{'>'}</span>}
        <div className={`h-9 w-9 flex items-center justify-center rounded-sm text-sm ${
          day === selectedDay ? 'bg-emerald-700' : 'bg-[#1A1F2E] border-[0.5px] border-gray-700 hover:border-emerald-600'
        }`}>
          {day}
        </div>
        {children}
      </div>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-[#0B0F17] text-white p-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-light">{dayName}</h1>
            <p className="text-sm text-gray-400 mt-1">Daily Planner</p>
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* Left Section - Week Selector and Daily Todo */}
            <div className="col-span-4 flex">
              {/* Week Selector */}
              <div className="mr-4 mt-8">
                {weekDays.map((day, index) => (
                  <DroppableDay 
                    key={day} 
                    day={day} 
                    isSelected={index === adjustedIndex}
                    children={null}
                  />
                ))}
              </div>
              
              {/* Daily Todo */}
              <div className="flex-1">
                <DailyTodo 
                  key={`daily-todo-${selectedDay}-${refreshTrigger}`}
                  selectedDay={selectedDay}
                />
              </div>
            </div>

            {/* Middle Section - Weekly Todo */}
            <div className="col-span-4">
              <div className="mb-12">

              <WeeklyTodo /> 
              </div>
              
              <QuarterlyGoals />
            </div>

            {/* Right Section - Vision and Goals */}
            <div className="col-span-4 space-y-6">
              <Vision />
             
              <YearlyGoals />
            </div>
          </div>
        </div>
        <Nav />
      </div>
    </DndProvider>
  );
};
