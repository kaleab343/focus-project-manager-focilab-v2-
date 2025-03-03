import React, { useState, useEffect, KeyboardEvent } from 'react';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

const WeeklyTodo: React.FC = () => {
  // Initialize state with localStorage data
  const [todos, setTodos] = useState<Todo[]>(() => {
    try {
      const storedTodos = localStorage.getItem('weeklyTodos');
      return storedTodos ? JSON.parse(storedTodos) : [];
    } catch (error) {
      console.error('Error loading initial todos:', error);
      return [];
    }
  });
  const [showInput, setShowInput] = useState(false);
  const [newTodoText, setNewTodoText] = useState('');
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // Save todos to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('weeklyTodos', JSON.stringify(todos));
    } catch (error) {
      console.error('Error saving todos:', error);
    }
  }, [todos]);

  const addTodo = () => {
    if (newTodoText.trim() !== '') {
      const newTodo: Todo = {
        id: Date.now().toString(),
        text: newTodoText.trim(),
        completed: false
      };
      setTodos(prevTodos => [...prevTodos, newTodo]);
      setNewTodoText('');
      setShowInput(false);
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(prevTodos =>
      prevTodos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
  };

  const startEditing = (todo: Todo) => {
    setEditingTodoId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = () => {
    if (editingTodoId && editText.trim() !== '') {
      setTodos(prevTodos =>
        prevTodos.map(todo =>
          todo.id === editingTodoId ? { ...todo, text: editText.trim() } : todo
        )
      );
      setEditingTodoId(null);
      setEditText('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      addTodo();
    } else if (e.key === 'Escape') {
      setShowInput(false);
      setNewTodoText('');
    }
  };

  const handleEditKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      setEditingTodoId(null);
      setEditText('');
    }
  };

  return (
    <div className="rounded-lg p-4 w-full">
      <h2 className="mt-0 mb-4 text-2xl text-white">Weekly Goals</h2>
      <div className="mb-2.5">
        {todos.map(todo => (
          <div key={todo.id} className="flex items-center mb-2 relative group">
            <input
              type="checkbox"
              id={`weekly-todo-${todo.id}`}
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              className="mr-2.5 cursor-pointer"
            />
            {editingTodoId === todo.id ? (
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleEditKeyDown}
                autoFocus
                className="flex-1 px-3 py-1 border-none rounded bg-white/20 text-white text-sm placeholder-white/60 focus:outline-none"
              />
            ) : (
              <label 
                htmlFor={`weekly-todo-${todo.id}`}
                className={`inline-flex items-center cursor-pointer break-words text-lg ${
                  todo.completed ? 'line-through text-white/50' : ''
                }`}
                onDoubleClick={(e) => {
                  e.preventDefault();
                  if (!todo.completed) {
                    startEditing(todo);
                  }
                }}
              >
                {todo.text}
                <button 
                  className="bg-transparent border-none text-white/50 text-lg cursor-pointer px-1.5 ml-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:text-red-400 inline-flex items-center"
                  onClick={(e) => {
                    e.preventDefault();
                    deleteTodo(todo.id);
                  }}
                >
                  ×
                </button>
              </label>
            )}
          </div>
        ))}
      </div>
      
      {showInput ? (
        <div className="mt-2.5">
          <input
            type="text"
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a new weekly goal..."
            autoFocus
            className="w-full px-3 py-2 border-none rounded bg-white/20 text-white text-sm placeholder-white/60 focus:outline-none"
          />
        </div>
      ) : (
        <button 
          className="bg-transparent border-none w-[30px] h-[30px] flex items-center justify-center text-2xl text-white cursor-pointer"
          onClick={() => setShowInput(true)}
        >
          +
        </button>
      )}
    </div>
  );
};

export default WeeklyTodo; 