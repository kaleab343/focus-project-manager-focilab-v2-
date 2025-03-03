import React, { useEffect, useState } from "react";
import { MdDelete } from "react-icons/md";
import { CiSquarePlus } from "react-icons/ci";
import axios from "axios";
import "./Todo.css";
import { getMonday } from "./Utils";

function Todo() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");

  useEffect(() => {
    fetchTodosFromServer();
    fetchTodosFromLocalStorage(); // Initialize todos from localStorage
  }, []);

  const fetchTodosFromServer = async () => {
    try {
      const userId = localStorage.getItem("user_id");

      if (!userId) {
        console.error("User ID not found in localStorage");
        return;
      }

      const response = await axios.get(
        `https://foci-server.vercel.app/todo?userId=${userId}&weekStartDate=${getMonday()}`
      );
      const newTodos = response.data;
      setTodos(newTodos);

      localStorage.setItem("todos", JSON.stringify(newTodos));
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };

  const fetchTodosFromLocalStorage = () => {
    const storedTodos = localStorage.getItem("todos");
    if (!storedTodos) {
      const emptyTodos = [];
      localStorage.setItem("todos", JSON.stringify(emptyTodos));
      setTodos(emptyTodos);
    } else {
      setTodos(JSON.parse(storedTodos));
    }
  };

  const addTodo = async (text) => {
    const userId = localStorage.getItem("user_id");

    if (!userId) {
      console.error("User ID not found in localStorage");
      return;
    }

    const newTodo = {
      user_id: userId,
      week_start_date: `${getMonday()}`,
      date: new Date(),
      description: text,
      status: false,
    };

    try {
      const storedTodos = JSON.parse(localStorage.getItem("todos")) || [];
      const updatedTodos = [...storedTodos, newTodo];
      localStorage.setItem("todos", JSON.stringify(updatedTodos));

      setTodos((prevTodos) => [...prevTodos, newTodo]);
      setNewTodo("");

      const response = await axios.post(
        "https://foci-server.vercel.app/todo",
        newTodo
      );
      console.log("New todo added successfully:", response.data);
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  const toggleTodo = async (todoId, status) => {
    try {
      const updatedTodos = todos.map((todo) =>
        todo._id === todoId ? { ...todo, status: !status } : todo
      );
      setTodos(updatedTodos);

      localStorage.setItem("todos", JSON.stringify(updatedTodos));

      const userId = localStorage.getItem("user_id");
      const weekStartDate = getMonday(); // Assuming getMonday returns the correct week start date
      const todoToUpdate = todos.find((todo) => todo._id === todoId);

      if (!userId) {
        console.error("User ID not found in localStorage");
        return;
      }

      await axios.post(
        `https://foci-server.vercel.app/todo/update/${userId}/${weekStartDate}`,
        {
          description: todoToUpdate.description,
          status: !status,
        }
      );
    } catch (error) {
      console.error("Error updating todo status:", error);
    }
  };
  const removeTodo = async (todoId) => {
    const userId = localStorage.getItem("user_id");
    const weekStartDate = getMonday();
    try {
      const updatedTodos = todos.filter((todo) => todo._id !== todoId);
      setTodos(updatedTodos);

      localStorage.setItem("todos", JSON.stringify(updatedTodos));

      await axios.post(
        `https://foci-server.vercel.app/todo/del/${userId}/${weekStartDate}/${todoId}`
      );
    } catch (error) {
      console.error("Error removing todo:", error);
    }
  };

  // Filter todos to include only today's tasks
  const filteredTodos = todos.filter(
    (todo) => new Date(todo.date).toDateString() === new Date().toDateString()
  );

  return (
    <div className="todo-list" id="todo-component">
      <h2>Todo</h2>

      <ul className="todos">
        {filteredTodos.map((todo) => (
          <li
            className="todo"
            key={todo._id}
            style={{
              textDecoration: todo.status ? "line-through" : "none",
            }}
          >
            <input
              type="checkbox"
              checked={todo.status}
              onChange={() => {
                toggleTodo(todo._id, todo.status);
              }}
            />
            <span>{todo.description}</span>
            <span
              className="remove-todo"
              onClick={() => {
                removeTodo(todo._id);
              }}
            >
              <MdDelete />
            </span>
          </li>
        ))}
      </ul>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          addTodo(newTodo);
        }}
      >
        <label htmlFor="new-todo">
          <CiSquarePlus className="add" />
        </label>
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          className="input"
          id="new-todo"
        />
      </form>
    </div>
  );
}

export default Todo;
