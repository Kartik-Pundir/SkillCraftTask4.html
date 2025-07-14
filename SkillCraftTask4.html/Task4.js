// script.js
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const landingPage = document.getElementById('landing-page');
    const dashboard = document.getElementById('dashboard');
    const startBtn = document.getElementById('start-btn');
    const themeToggle = document.getElementById('theme-toggle');
    const greeting = document.getElementById('greeting');
    const currentMonthEl = document.getElementById('current-month');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const calendarDays = document.getElementById('calendar-days');
    const selectedDateEl = document.getElementById('selected-date');
    const taskInput = document.getElementById('task-input');
    const taskTime = document.getElementById('task-time');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const totalTasksEl = document.getElementById('total-tasks');
    const completedTasksEl = document.getElementById('completed-tasks');
    const pendingTasksEl = document.getElementById('pending-tasks');
    const motivationEl = document.getElementById('motivation');
    const notesInput = document.getElementById('notes-input');
    const saveNotesBtn = document.getElementById('save-notes-btn');

    // App State
    let currentDate = new Date();
    let selectedDate = new Date();
    let tasks = JSON.parse(localStorage.getItem('tasks')) || {};
    let notes = JSON.parse(localStorage.getItem('notes')) || {};
    let darkMode = localStorage.getItem('darkMode') === 'true';

    // Initialize the app
    function init() {
        // Set theme
        if (darkMode) {
            document.body.setAttribute('data-theme', 'dark');
        }

        // Set greeting
        setGreeting();

        // Set up event listeners
        startBtn.addEventListener('click', showDashboard);
        themeToggle.addEventListener('click', toggleTheme);
        prevMonthBtn.addEventListener('click', prevMonth);
        nextMonthBtn.addEventListener('click', nextMonth);
        addTaskBtn.addEventListener('click', addTask);
        taskInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') addTask();
        });
        saveNotesBtn.addEventListener('click', saveNotes);

        // Load calendar and tasks
        renderCalendar();
        updateSelectedDate(selectedDate);
        loadNotes();
        updateStats();
    }

    // Show dashboard when start button is clicked
    function showDashboard() {
        landingPage.classList.add('hidden');
        dashboard.classList.remove('hidden');
    }

    // Toggle between dark and light theme
    function toggleTheme() {
        darkMode = !darkMode;
        localStorage.setItem('darkMode', darkMode);
        if (darkMode) {
            document.body.setAttribute('data-theme', 'dark');
        } else {
            document.body.removeAttribute('data-theme');
        }
    }

    // Set greeting based on time of day
    function setGreeting() {
        const hour = new Date().getHours();
        let timeOfDay = 'Day';
        
        if (hour < 12) timeOfDay = 'Morning';
        else if (hour < 18) timeOfDay = 'Afternoon';
        else timeOfDay = 'Evening';

        greeting.textContent = `Good ${timeOfDay}, User!`;
    }

    // Render calendar for current month
    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        currentMonthEl.textContent = new Intl.DateTimeFormat('en-US', { 
            month: 'long', 
            year: 'numeric' 
        }).format(currentDate);

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();

        calendarDays.innerHTML = '';

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.classList.add('calendar-day', 'empty');
            calendarDays.appendChild(emptyDay);
        }

        // Add days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            const day = document.createElement('div');
            day.classList.add('calendar-day');
            day.textContent = i;
            day.addEventListener('click', () => selectDate(new Date(year, month, i)));

            // Check if this date has tasks
            const dateKey = formatDate(new Date(year, month, i));
            if (tasks[dateKey] && tasks[dateKey].length > 0) {
                day.classList.add('has-tasks');
            }

            // Highlight today
            if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                day.classList.add('today');
            }

            // Highlight selected date
            if (i === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear()) {
                day.classList.add('selected');
            }

            calendarDays.appendChild(day);
        }
    }

    // Navigate to previous month
    function prevMonth() {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    }

    // Navigate to next month
    function nextMonth() {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    }

    // Select a date
    function selectDate(date) {
        selectedDate = date;
        updateSelectedDate(date);
        renderCalendar(); // Re-render to update selected date highlight
    }

    // Update UI for selected date
    function updateSelectedDate(date) {
        selectedDateEl.textContent = formatDate(date, true);
        renderTasks(date);
    }

    // Format date as YYYY-MM-DD for keys or readable string for display
    function formatDate(date, readable = false) {
        if (readable) {
            return date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
            });
        }
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Render tasks for selected date
    function renderTasks(date) {
        const dateKey = formatDate(date);
        taskList.innerHTML = '';

        if (!tasks[dateKey] || tasks[dateKey].length === 0) {
            taskList.innerHTML = '<p class="no-tasks">No tasks for this day. Add one above!</p>';
            return;
        }

        tasks[dateKey].forEach((task, index) => {
            const taskEl = document.createElement('div');
            taskEl.classList.add('task-item');
            if (task.completed) {
                taskEl.classList.add('completed');
            } else {
                taskEl.classList.add('pending');
            }

            taskEl.innerHTML = `
                <div class="task-content">
                    <div class="task-text">${task.text}</div>
                    ${task.time ? `<div class="task-time">${task.time}</div>` : ''}
                    ${task.note ? `<div class="task-note">${task.note}</div>` : ''}
                </div>
                <div class="task-actions">
                    <button class="task-btn complete-btn" data-index="${index}">✅</button>
                    <button class="task-btn delete-btn" data-index="${index}">🗑️</button>
                </div>
            `;

            taskList.appendChild(taskEl);
        });

        // Add event listeners to new task buttons
        document.querySelectorAll('.complete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                toggleTaskComplete(this.dataset.index);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                deleteTask(this.dataset.index);
            });
        });
    }

    // Add a new task
    function addTask() {
        const taskText = taskInput.value.trim();
        if (!taskText) return;

        const taskTimeValue = taskTime.value;
        const dateKey = formatDate(selectedDate);

        if (!tasks[dateKey]) {
            tasks[dateKey] = [];
        }

        tasks[dateKey].push({
            text: taskText,
            time: taskTimeValue,
            completed: false
        });

        saveTasks();
        renderTasks(selectedDate);
        renderCalendar(); // Update calendar to show task indicator
        updateStats();

        // Clear input
        taskInput.value = '';
        taskTime.value = '';
    }

    // Toggle task completion status
    function toggleTaskComplete(index) {
        const dateKey = formatDate(selectedDate);
        tasks[dateKey][index].completed = !tasks[dateKey][index].completed;
        saveTasks();
        renderTasks(selectedDate);
        updateStats();
    }

    // Delete a task
    function deleteTask(index) {
        const dateKey = formatDate(selectedDate);
        tasks[dateKey].splice(index, 1);
        
        // Remove date key if no tasks left
        if (tasks[dateKey].length === 0) {
            delete tasks[dateKey];
        }

        saveTasks();
        renderTasks(selectedDate);
        renderCalendar(); // Update calendar to remove task indicator if needed
        updateStats();
    }

    // Save tasks to localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Load notes from localStorage
    function loadNotes() {
        const dateKey = formatDate(selectedDate);
        notesInput.value = notes[dateKey] || '';
    }

    // Save notes to localStorage
    function saveNotes() {
        const dateKey = formatDate(selectedDate);
        notes[dateKey] = notesInput.value;
        localStorage.setItem('notes', JSON.stringify(notes));
    }

    // Update statistics and motivation message
    function updateStats() {
        let total = 0;
        let completed = 0;

        // Count all tasks
        Object.values(tasks).forEach(dateTasks => {
            total += dateTasks.length;
            completed += dateTasks.filter(task => task.completed).length;
        });

        totalTasksEl.textContent = total;
        completedTasksEl.textContent = completed;
        pendingTasksEl.textContent = total - completed;

        // Set motivation message
        if (total === 0) {
            motivationEl.textContent = "Let's get started! Add your first task.";
        } else if (completed === total) {
            motivationEl.textContent = "Amazing! All tasks completed! 🎉";
        } else if (completed / total >= 0.75) {
            motivationEl.textContent = "Great progress! Keep going! 💪";
        } else if (completed / total >= 0.5) {
            motivationEl.textContent = "You're halfway there! 😊";
        } else if (completed / total >= 0.25) {
            motivationEl.textContent = "Making progress! Keep it up! 👍";
        } else {
            motivationEl.textContent = "Getting started is the hardest part! You got this! 💯";
        }
    }

    // Initialize the app
    init();
});