import React, { useState } from 'react';
import Nav from '../components/Nav';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

const DailyPlanner: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTask, setNewTask] = useState('');
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const addTodo = (text: string) => {
    if (text.trim()) {
      setTodos([...todos, { id: Date.now(), text, completed: false }]);
      setNewTask('');
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white p-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-2">
          <h1 className="text-3xl font-light">Wednesday</h1>
          <p className="text-sm text-gray-400 mt-1">Daily Planner</p>
        </div>
        
        <div className="grid grid-cols-12 gap-16 mt-8">
          {/* Left Sidebar - Days */}
          <div className="col-span-1">
            {weekDays.map((day) => (
              <div
                key={day}
                className={`h-9 w-9 flex items-center justify-center mb-3 rounded-sm text-sm ${
                  day === 'We' ? 'bg-emerald-700' : 'bg-[#1A1F2E] border-[0.5px] border-gray-700'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Main Content */}
          <div className="col-span-11 grid grid-cols-3 gap-16">
            {/* Todo Section */}
            <div className="col-span-1">
              <h2 className="text-xl font-light mb-6">Todo | {formattedDate}</h2>
              <div className="space-y-4">
                {todos.map(todo => (
                  <div
                    key={todo.id}
                    className="flex items-center space-x-3"
                    onClick={() => toggleTodo(todo.id)}
                  >
                    <div className={`w-5 h-5 border border-gray-600 rounded-sm flex items-center justify-center ${todo.completed ? 'bg-emerald-700 border-emerald-700' : ''}`}>
                      {todo.completed && <span className="text-white text-xs">✓</span>}
                    </div>
                    <span className={`${todo.completed ? 'line-through text-gray-500' : ''}`}>
                      {todo.text}
                    </span>
                  </div>
                ))}
                <div className="flex items-center mt-6 space-x-3">
                  <button
                    onClick={() => addTodo(newTask)}
                    className="w-7 h-7 bg-[#1A1F2E] border-[0.5px] border-gray-700 rounded-sm flex items-center justify-center text-gray-400"
                  >
                    +
                  </button>
                  <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Add new task"
                    className="flex-1 bg-transparent text-sm text-gray-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Brain Dump Section */}
            <div className="col-span-1">
              <h2 className="text-xl font-light mb-6">Brain Dump</h2>
              <textarea
                className="w-full h-48 bg-[#1A1F2E] border-[0.5px] border-gray-700 rounded-sm p-4 text-sm text-gray-400 focus:outline-none resize-none"
                placeholder="Write down anything in your head..."
              />
            </div>

            {/* Gratitude Section */}
            <div className="col-span-1">
              <div className="mb-12">
                <h2 className="text-xl font-light mb-6">Morning Gratitude</h2>
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-500">•</span>
                    <div className="flex-1 h-[1px] bg-gray-700"></div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-500">•</span>
                    <div className="flex-1 h-[1px] bg-gray-700"></div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-500">•</span>
                    <div className="flex-1 h-[1px] bg-gray-700"></div>
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-light mb-6">Night Gratitude</h2>
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-500">•</span>
                    <div className="flex-1 h-[1px] bg-gray-700"></div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-500">•</span>
                    <div className="flex-1 h-[1px] bg-gray-700"></div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-500">•</span>
                    <div className="flex-1 h-[1px] bg-gray-700"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 flex justify-between items-center text-sm">
          <button className="text-gray-400 flex items-center space-x-2">
            <span>⌂</span>
            <span>home</span>
          </button>
          <div className="space-x-4">
            <button className="bg-emerald-700 px-4 py-2 rounded-sm">Current Week</button>
            <button className="text-gray-400">Next Week</button>
          </div>
          <div className="text-gray-400">
            Monthly | Weekly | 🌙
          </div>
        </div>
      </div>
      <Nav />
    </div>
  );
};

export default DailyPlanner; 