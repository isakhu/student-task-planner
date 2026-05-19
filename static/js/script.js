// Wait for the DOM to fully load before running JavaScript
document.addEventListener('DOMContentLoaded', function() {
    
    // Get references to HTML elements we'll need
    const taskForm = document.getElementById('taskForm');
    const taskTitle = document.getElementById('taskTitle');
    const taskDeadline = document.getElementById('taskDeadline');
    const tasksList = document.getElementById('tasksList');
    const darkModeToggle = document.getElementById('darkModeToggle');
    
    // Dashboard stat elements
    const totalTasksEl = document.getElementById('totalTasks');
    const completedTasksEl = document.getElementById('completedTasks');
    const pendingTasksEl = document.getElementById('pendingTasks');
    
    // Initialize the app
    init();
    
    /**
     * Initialize the application
     * Load tasks and set up dark mode
     */
    function init() {
        loadTasks();
        loadDarkModePreference();
    }
    
    /**
     * Load dark mode preference from localStorage
     * localStorage saves data in the browser even after closing
     */
    function loadDarkModePreference() {
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }
    
    /**
     * Toggle dark mode on/off
     */
    darkModeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        
        // Save preference to localStorage
        localStorage.setItem('darkMode', isDarkMode);
        
        // Change icon
        if (isDarkMode) {
            darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    });
    
    /**
     * Handle form submission to add a new task
     */
    taskForm.addEventListener('submit', function(e) {
        // Prevent the default form submission (page reload)
        e.preventDefault();
        
        // Get values from form inputs
        const title = taskTitle.value.trim();
        const deadline = taskDeadline.value;
        
        // Validate inputs
        if (!title || !deadline) {
            alert('Please fill in all fields!');
            return;
        }
        
        // Create task object
        const taskData = {
            title: title,
            deadline: deadline
        };
        
        // Send POST request to Flask backend
        fetch('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        })
        .then(response => response.json())
        .then(data => {
            // Clear form inputs
            taskTitle.value = '';
            taskDeadline.value = '';
            
            // Reload tasks to show the new one
            loadTasks();
            
            // Show success message
            showNotification('Task added successfully!', 'success');
        })
        .catch(error => {
            console.error('Error adding task:', error);
            showNotification('Error adding task!', 'error');
        });
    });
    
    /**
     * Load all tasks from the backend
     * This function makes a GET request to our Flask API
     */
    function loadTasks() {
        fetch('/api/tasks')
            .then(response => response.json())
            .then(tasks => {
                displayTasks(tasks);
                updateDashboard(tasks);
            })
            .catch(error => {
                console.error('Error loading tasks:', error);
            });
    }
    
    /**
     * Display tasks in the UI
     * @param {Array} tasks - Array of task objects
     */
    function displayTasks(tasks) {
        // Clear existing tasks
        tasksList.innerHTML = '';
        
        // If no tasks, the empty state will show automatically
        if (tasks.length === 0) {
            return;
        }
        
        // Create HTML for each task
        tasks.forEach(task => {
            const taskCard = createTaskCard(task);
            tasksList.appendChild(taskCard);
        });
    }
    
    /**
     * Create HTML element for a single task
     * @param {Object} task - Task object with id, title, deadline, completed
     * @returns {HTMLElement} - Task card element
     */
    function createTaskCard(task) {
        // Create main task card div
        const taskCard = document.createElement('div');
        taskCard.className = 'task-card';
        if (task.completed) {
            taskCard.classList.add('completed');
        }
        
        // Format the deadline date
        const deadlineDate = new Date(task.deadline);
        const formattedDeadline = deadlineDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        // Calculate days until deadline
        const today = new Date();
        const daysUntil = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
        let deadlineClass = '';
        let deadlineText = '';
        
        if (daysUntil < 0) {
            deadlineText = 'Overdue';
            deadlineClass = 'overdue';
        } else if (daysUntil === 0) {
            deadlineText = 'Due today';
            deadlineClass = 'today';
        } else if (daysUntil === 1) {
            deadlineText = 'Due tomorrow';
            deadlineClass = 'tomorrow';
        } else {
            deadlineText = `${daysUntil} days left`;
        }
        
        // Build the HTML structure
        taskCard.innerHTML = `
            <div class="task-info">
                <h3>${escapeHtml(task.title)}</h3>
                <div class="task-meta">
                    <span>
                        <i class="fas fa-calendar"></i>
                        ${formattedDeadline}
                    </span>
                    <span class="${deadlineClass}">
                        <i class="fas fa-clock"></i>
                        ${deadlineText}
                    </span>
                </div>
            </div>
            <div class="task-actions">
                <button class="btn-complete" onclick="toggleTask(${task.id}, ${!task.completed})" title="${task.completed ? 'Mark as incomplete' : 'Mark as complete'}">
                    <i class="fas fa-${task.completed ? 'undo' : 'check'}"></i>
                </button>
                <button class="btn-delete" onclick="deleteTask(${task.id})" title="Delete task">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        return taskCard;
    }
    
    /**
     * Update dashboard statistics
     * @param {Array} tasks - Array of task objects
     */
    function updateDashboard(tasks) {
        const total = tasks.length;
        const completed = tasks.filter(task => task.completed).length;
        const pending = total - completed;
        
        // Update the numbers with animation
        animateValue(totalTasksEl, parseInt(totalTasksEl.textContent) || 0, total, 500);
        animateValue(completedTasksEl, parseInt(completedTasksEl.textContent) || 0, completed, 500);
        animateValue(pendingTasksEl, parseInt(pendingTasksEl.textContent) || 0, pending, 500);
    }
    
    /**
     * Animate number changes in dashboard
     * @param {HTMLElement} element - Element to update
     * @param {number} start - Starting number
     * @param {number} end - Ending number
     * @param {number} duration - Animation duration in ms
     */
    function animateValue(element, start, end, duration) {
        const range = end - start;
        const increment = range / (duration / 16); // 60 FPS
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                current = end;
                clearInterval(timer);
            }
            element.textContent = Math.round(current);
        }, 16);
    }
    
    /**
     * Toggle task completion status
     * This function is called from the HTML onclick attribute
     * @param {number} taskId - ID of the task to toggle
     * @param {boolean} completed - New completion status
     */
    window.toggleTask = function(taskId, completed) {
        fetch(`/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ completed: completed })
        })
        .then(response => response.json())
        .then(data => {
            loadTasks();
            showNotification(completed ? 'Task completed! 🎉' : 'Task marked as incomplete', 'success');
        })
        .catch(error => {
            console.error('Error updating task:', error);
            showNotification('Error updating task!', 'error');
        });
    };
    
    /**
     * Delete a task
     * This function is called from the HTML onclick attribute
     * @param {number} taskId - ID of the task to delete
     */
    window.deleteTask = function(taskId) {
        // Confirm before deleting
        if (!confirm('Are you sure you want to delete this task?')) {
            return;
        }
        
        fetch(`/api/tasks/${taskId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            loadTasks();
            showNotification('Task deleted successfully!', 'success');
        })
        .catch(error => {
            console.error('Error deleting task:', error);
            showNotification('Error deleting task!', 'error');
        });
    };
    
    /**
     * Show a notification message
     * @param {string} message - Message to display
     * @param {string} type - Type of notification (success, error)
     */
    function showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    /**
     * Escape HTML to prevent XSS attacks
     * This is important for security when displaying user input
     * @param {string} text - Text to escape
     * @returns {string} - Escaped text
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});
