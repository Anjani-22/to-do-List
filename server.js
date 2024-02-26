const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs"); // For file persistence (bonus)

const app = express();
const port = 3000;

// Data store (initially an array)
let tasks = [];

// Load tasks from JSON file (bonus)
try {
  const data = fs.readFileSync("tasks.json", "utf8");
  tasks = JSON.parse(data);
} catch (err) {
  console.error("Error loading tasks:", err);
}

// Middleware
app.use(bodyParser.json());
app.use(logRequest);

// Routes
app.get("/tasks", getTasks);
app.post("/tasks", addTask);
app.get("/tasks/:id", getTaskById);
app.put("/tasks/:id", updateTask);
app.delete("/tasks/:id", deleteTask);

// Error handling middleware
app.use(handleError);

// Start the server
app.listen(port, () => console.log(`Server listening on port ${port}`));

// Functions for routes and middleware

function logRequest(req, res, next) {
  console.log(`${req.method} ${req.url}`);
  next();
}

function handleError(err, req, res, next) {
  console.error(err.stack);
  res.status(err.statusCode || 500).send({ message: err.message });
}

// Route functions

function getTasks(req, res) {
  res.json(tasks);
}

function addTask(req, res) {
  const { title, description } = req.body;

  // Validation
  if (!title || !description) {
    return res
      .status(400)
      .send({ message: "Title and description are required" });
  }

  const newTask = {
    id: Date.now().toString(),
    title,
    description,
    completed: false, // Bonus: initial completed state
  };

  tasks.push(newTask);

  // Save tasks to JSON file (bonus)
  fs.writeFileSync("tasks.json", JSON.stringify(tasks, null, 2));

  res.status(201).json(newTask);
}

function getTaskById(req, res) {
  const { id } = req.params;

  const task = tasks.find((task) => task.id === id);

  if (!task) {
    return res.status(404).send({ message: "Task not found" });
  }

  res.json(task);
}

function updateTask(req, res) {
  const { id } = req.params;
  const { title, description, completed } = req.body; // Bonus: include completed

  // Validation
  if (!title || !description) {
    return res
      .status(400)
      .send({ message: "Title and description are required" });
  }

  const taskIndex = tasks.findIndex((task) => task.id === id);

  if (taskIndex === -1) {
    return res.status(404).send({ message: "Task not found" });
  }

  tasks[taskIndex] = { ...tasks[taskIndex], title, description, completed }; // Update task

  // Save tasks to JSON file (bonus)
  fs.writeFileSync("tasks.json", JSON.stringify(tasks, null, 2));

  res.json(tasks[taskIndex]);
}

function deleteTask(req, res) {
  const { id } = req.params;

  const taskIndex = tasks.findIndex((task) => task.id === id);

  if (taskIndex === -1) {
    return res.status(404).send({ message: "Task not found" });
  }

  tasks.splice(taskIndex, 1); // Remove task

  // Save tasks to JSON file (bonus)
  fs.writeFileSync("tasks.json", JSON.stringify(tasks, null, 2));

  res.status(204).send(); // No content
}
