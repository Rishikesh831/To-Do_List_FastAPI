import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    fetch('http://127.0.0.1:8000/tasks')
      .then(response => response.json())
      .then(data => setTasks(data));
  }, []);

  const createTask = (e) => {
    e.preventDefault();
    fetch('http://127.0.0.1:8000/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        description,
        deadline: deadline ? parseInt(deadline, 10) : null,
      }),
    })
      .then(response => response.json())
      .then(newTask => {
        setTasks([...tasks, newTask]);
        setTitle('');
        setDescription('');
        setDeadline('');
      });
  };

  const deleteTask = (taskId) => {
    fetch(`http://127.0.0.1:8000/tasks/${taskId}`, {
      method: 'DELETE',
    }).then(() => {
      setTasks(tasks.filter(task => task.id !== taskId));
    });
  };

  const toggleDone = (task) => {
    const updatedTask = { ...task, done: !task.done };
    fetch(`http://127.0.0.1:8000/tasks/${task.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedTask),
    })
      .then(response => response.json())
      .then(data => {
        setTasks(tasks.map(t => (t.id === task.id ? data : t)));
      });
  };


  return (
    <div className="App">
      <h1>Todo App</h1>
      <form onSubmit={createTask}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="number"
          placeholder="Deadline (in days)"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
        <button type="submit">Add Task</button>
      </form>
      <div className="task-list">
        {tasks.map(task => (
          <div key={task.id} className="task">
            <h2>{task.title}</h2>
            <p>{task.description}</p>
            <p>Deadline: {task.deadline}</p>
            <p>Status: {task.done ? 'Done' : 'Not Done'}</p>
            <button onClick={() => toggleDone(task)}>Toggle Done</button>
            <button onClick={() => deleteTask(task.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
