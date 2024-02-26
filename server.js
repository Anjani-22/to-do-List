const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");

const app = express();
const port = 3000;

app.use(express.static("public"));
app.set("view engine", "ejs"); // Set EJS as the view engine
app.set("views", "./views"); // Set the directory for views

let tasks = [];

try {
  const data = fs.readFileSync("tasks.json", "utf8");
  tasks = JSON.parse(data);
} catch (err) {
  console.error("Error loading tasks:", err);
}

app.use(bodyParser.json());

// Middleware for logging requests
app.use(logRequest);

// Routes
app.get("/tasks", getTasks);
app.get("/tasks/new", showAddTaskForm); // Route to show add task form
app.post("/tasks", addTask);
app.get("/tasks/:id", getTaskById);
app.get("/tasks/:id/edit", showUpdateTaskForm); // Route to show update task form
app.put("/tasks/:id", updateTask);
app.delete("/tasks/:id", deleteTask);

// Error handling middleware
app.use(handleError);

// Start the server
app.listen(port, () => console.log(`Server listening on port ${port}`));

// Middleware function to log requests
function logRequest(req, res, next) {
  console.log(`${req.method} ${req.url}`);
  next();
}

// Middleware function to handle errors
function handleError(err, req, res, next) {
  if (err.stack);
  res.status(err.statusCode || 500).send({ message: err.message });
}

// Route handlers

function getTasks(req, res) {
  res.render("tasks", { tasks }); // Render tasks.ejs with tasks data
}

function showAddTaskForm(req, res) {
  res.render("addTask"); // Render addTask.ejs
}

function addTask(req, res) {
  const { title, description } = req.body;

  if (!title || !description) {
    return res
      .status(400)
      .send({ message: "Title and description are required" });
  }

  const newTask = {
    id: Date.now().toString(),
    title,
    description,
    completed: false,
  };

  tasks.push(newTask);

  fs.writeFileSync("tasks.json", JSON.stringify(tasks, null, 2));

  res.redirect("/tasks"); // Redirect to tasks page after adding task
}

function getTaskById(req, res) {
  const { id } = req.params;

  const task = tasks.find((task) => task.id === id);

  if (!task) {
    return res.status(404).send({ message: "Task not found" });
  }

  res.render("updateTask", { task }); // Render updateTask.ejs with task data
}

function showUpdateTaskForm(req, res) {
  const { id } = req.params;

  const task = tasks.find((task) => task.id === id);

  if (!task) {
    return res.status(404).send({ message: "Task not found" });
  }

  res.render("updateTask", { task }); // Render updateTask.ejs with task data
}

function updateTask(req, res) {
  const { id } = req.params;
  const { title, description, completed } = req.body;

  if (!title || !description) {
    return res
      .status(400)
      .send({ message: "Title and description are required" });
  }

  const taskIndex = tasks.findIndex((task) => task.id === id);

  if (taskIndex === -1) {
    return res.status(404).send({ message: "Task not found" });
  }

  tasks[taskIndex] = { ...tasks[taskIndex], title, description, completed };

  fs.writeFileSync("tasks.json", JSON.stringify(tasks, null, 2));

  res.redirect("/tasks"); // Redirect to tasks page after updating task
}

function deleteTask(req, res) {
  const { id } = req.params;

  const taskIndex = tasks.findIndex((task) => task.id === id);

  if (taskIndex === -1) {
    return res.status(404).send({ message: "Task not found" });
  }

  tasks.splice(taskIndex, 1);

  fs.writeFileSync("tasks.json", JSON.stringify(tasks, null, 2));

  res.redirect("/tasks"); // Redirect to tasks page after deleting task
}
