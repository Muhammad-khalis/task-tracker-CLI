
const fs = require('fs');
const path = require('path');

const tasksFile = path.join(__dirname, 'tasks.json');

// Helper: read tasks
function readTasks() {
    if (!fs.existsSync(tasksFile)) return [];
    return JSON.parse(fs.readFileSync(tasksFile, 'utf-8'));
}

// Helper: save tasks
function saveTasks(tasks) {
    fs.writeFileSync(tasksFile, JSON.stringify(tasks, null, 2));
}

// Generate unique ID
function generateId(tasks) {
    return tasks.length ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
}

// Helper: list tasks
function listTasks(filter) {
    const tasks = readTasks();
    let filtered = tasks;

    if (filter === 'done') filtered = tasks.filter(t => t.status === 'done');
    else if (filter === 'todo') filtered = tasks.filter(t => t.status === 'todo');
    else if (filter === 'in-progress') filtered = tasks.filter(t => t.status === 'in-progress');

    if (!filtered.length) console.log('No tasks found.');
    else {
        filtered.forEach(t => {
            console.log(`[${t.id}] ${t.description} - ${t.status} (Updated: ${t.updatedAt})`);
        });
    }
}

// Command-line arguments
const [,, command, ...args] = process.argv;

if (!command || command === '--help') {
    console.log(`
Task Tracker CLI

Usage:
  task-cli add "Task description"
  task-cli update <id> "New description"
  task-cli delete <id>
  task-cli mark-in-progress <id>
  task-cli mark-done <id>
  task-cli list [status]

Status options:
  todo          Tasks not started
  in-progress   Tasks in progress
  done          Completed tasks
`);
    process.exit(0);
}

let tasks = readTasks();

switch(command) {
    case 'add':
        const description = args.join(' ');
        if (!description) {
            console.log('Please provide a task description.');
            break;
        }

        // Prevent duplicate
        if (tasks.some(t => t.description.toLowerCase() === description.toLowerCase())) {
            console.log('Task already exists!');
            listTasks();
            break;
        }

        const newTask = {
            id: generateId(tasks),
            description,
            status: 'todo',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        tasks.push(newTask);
        saveTasks(tasks);
        console.log(`Task added successfully (ID: ${newTask.id})`);
        listTasks();
        break;

    case 'update':
        const updateId = parseInt(args[0]);
        const updateDesc = args.slice(1).join(' ');
        const taskToUpdate = tasks.find(t => t.id === updateId);
        if (!taskToUpdate) {
            console.log('Task not found.');
            break;
        }
        taskToUpdate.description = updateDesc || taskToUpdate.description;
        taskToUpdate.updatedAt = new Date().toISOString();
        saveTasks(tasks);
        console.log('Task updated successfully.');
        listTasks();
        break;

    case 'delete':
        const deleteId = parseInt(args[0]);
        const index = tasks.findIndex(t => t.id === deleteId);
        if (index === -1) {
            console.log('Task not found.');
            break;
        }
        tasks.splice(index, 1);
        saveTasks(tasks);
        console.log('Task deleted successfully.');
        listTasks();
        break;

    case 'mark-in-progress':
        const inProgId = parseInt(args[0]);
        const taskProg = tasks.find(t => t.id === inProgId);
        if (!taskProg) { console.log('Task not found.'); break; }
        taskProg.status = 'in-progress';
        taskProg.updatedAt = new Date().toISOString();
        saveTasks(tasks);
        console.log('Task marked as in-progress.');
        listTasks();
        break;

    case 'mark-done':
        const doneId = parseInt(args[0]);
        const taskDone = tasks.find(t => t.id === doneId);
        if (!taskDone) { console.log('Task not found.'); break; }
        taskDone.status = 'done';
        taskDone.updatedAt = new Date().toISOString();
        saveTasks(tasks);
        console.log('Task marked as done.');
        listTasks();
        break;

    case 'list':
        const statusFilter = args[0];
        listTasks(statusFilter);
        break;

    default:
        console.log('Unknown command. Type "task-cli" or "task-cli --help" for usage.');
}
