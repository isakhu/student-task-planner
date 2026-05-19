# 🎓 Student Task Planner

A beginner-friendly web application built with Flask, HTML, CSS, and JavaScript to help students manage their tasks effectively.

## ✨ Features

- ✅ Add new tasks with deadlines
- 🗑️ Delete tasks
- ✔️ Mark tasks as completed/incomplete
- 📅 View task deadlines with countdown
- 🌙 Dark mode toggle
- 📱 Fully responsive design
- 💾 Persistent storage using JSON
- 📊 Dashboard with task statistics

## 📁 Project Structure

```
student-task-planner/
│
├── app.py                  # Flask backend (main application)
├── requirements.txt        # Python dependencies
├── tasks.json             # Task data storage (auto-generated)
│
├── templates/
│   └── index.html         # Main HTML template
│
└── static/
    ├── css/
    │   └── style.css      # Styling
    └── js/
        └── script.js      # Frontend JavaScript
```

## 🚀 How to Run the Project

### Step 1: Install Python
Make sure you have Python 3.7+ installed. Check with:
```bash
python --version
```

### Step 2: Install Flask
Navigate to the project folder and install dependencies:
```bash
pip install -r requirements.txt
```

Or install Flask directly:
```bash
pip install Flask
```

### Step 3: Run the Application
```bash
python app.py
```

### Step 4: Open in Browser
Open your web browser and go to:
```
http://localhost:5000
```

## 📚 Detailed Explanations

### 1. How Flask Works

Flask is a lightweight Python web framework that helps you build web applications.

**Key Concepts:**
- **Routes**: URLs that users can visit (e.g., `/`, `/api/tasks`)
- **Views**: Functions that handle requests and return responses
- **Templates**: HTML files that Flask renders with dynamic data
- **Static Files**: CSS, JavaScript, images that don't change

**Example from app.py:**
```python
@app.route('/')
def index():
    return render_template('index.html')
```
- `@app.route('/')` - Decorator that maps the URL `/` to the function
- `render_template()` - Renders the HTML template

### 2. How HTML Connects to Flask

Flask uses **Jinja2 templating** to connect HTML with Python.

**In index.html:**
```html
<link rel="stylesheet" href="{{ url_for('static', filename='css/style.css') }}">
```

- `{{ }}` - Jinja2 syntax for inserting Python expressions
- `url_for()` - Flask function that generates URLs
- `'static'` - Tells Flask to look in the static folder
- `filename='css/style.css'` - Path to the CSS file

**How it works:**
1. User visits `http://localhost:5000/`
2. Flask calls the `index()` function
3. Flask renders `index.html` template
4. Jinja2 processes `{{ }}` expressions
5. Browser receives complete HTML

### 3. How CSS is Linked

CSS is linked using Flask's `url_for()` function:

```html
<link rel="stylesheet" href="{{ url_for('static', filename='css/style.css') }}">
```

**Why use `url_for()` instead of direct paths?**
- Works correctly even if you move your app
- Handles URL prefixes automatically
- Better for production deployment

**CSS Variables:**
```css
:root {
    --primary-color: #6366f1;
    --bg-color: #f8fafc;
}
```
- CSS variables make it easy to change colors
- Used for dark mode switching

### 4. How JavaScript Works in the App

JavaScript handles all frontend interactions without page reloads.

**Key Functions:**

**a) Loading Tasks:**
```javascript
fetch('/api/tasks')
    .then(response => response.json())
    .then(tasks => displayTasks(tasks));
```
- `fetch()` - Makes HTTP requests to the backend
- Sends GET request to `/api/tasks`
- Receives JSON data
- Updates the UI

**b) Adding Tasks:**
```javascript
fetch('/api/tasks', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(taskData)
})
```
- Sends POST request with task data
- Backend saves the task
- Frontend reloads tasks

**c) Event Listeners:**
```javascript
taskForm.addEventListener('submit', function(e) {
    e.preventDefault(); // Prevents page reload
    // Handle form submission
});
```

### 5. How Task Saving Works

Tasks are saved in a JSON file (`tasks.json`).

**Data Flow:**

1. **User adds task** → JavaScript sends POST request
2. **Flask receives data** → `add_task()` function processes it
3. **Load existing tasks** → `load_tasks()` reads JSON file
4. **Add new task** → Append to tasks list
5. **Save to file** → `save_tasks()` writes JSON file
6. **Return response** → JavaScript updates UI

**JSON Structure:**
```json
[
    {
        "id": 1,
        "title": "Study for Math Exam",
        "deadline": "2026-05-25",
        "completed": false,
        "created_at": "2026-05-19 10:30:00"
    }
]
```

**Why JSON?**
- Simple and human-readable
- Easy to parse in Python and JavaScript
- No database setup required
- Perfect for beginners

**Alternative: SQLite**
For larger applications, you could use SQLite:
```python
import sqlite3

conn = sqlite3.connect('tasks.db')
cursor = conn.cursor()
cursor.execute('''CREATE TABLE tasks
                  (id INTEGER PRIMARY KEY, title TEXT, deadline TEXT)''')
```

### 6. API Endpoints Explained

**GET /api/tasks**
- Returns all tasks as JSON
- Used by JavaScript to display tasks

**POST /api/tasks**
- Creates a new task
- Receives JSON data from frontend
- Returns the created task

**PUT /api/tasks/<id>**
- Updates a task (mark as complete/incomplete)
- `<id>` is a URL parameter
- Receives updated data as JSON

**DELETE /api/tasks/<id>**
- Deletes a task by ID
- Returns success message

## 🎨 Features Breakdown

### Dark Mode
- Uses CSS variables for easy color switching
- Preference saved in browser's localStorage
- Persists across sessions

### Responsive Design
- Uses CSS Grid and Flexbox
- Media queries for mobile devices
- Works on phones, tablets, and desktops

### Dashboard Statistics
- Calculates total, completed, and pending tasks
- Animated number updates
- Real-time updates

## 🔧 Customization Ideas

1. **Add Categories**: Add task categories (homework, projects, exams)
2. **Priority Levels**: Add high/medium/low priority
3. **Search**: Add search functionality
4. **Filters**: Filter by completed/pending/overdue
5. **Export**: Export tasks to PDF or CSV
6. **Notifications**: Browser notifications for due tasks

## 🐛 Troubleshooting

**Port already in use:**
```bash
python app.py --port 5001
```

**Flask not found:**
```bash
pip install Flask
```

**Tasks not saving:**
- Check file permissions
- Ensure `tasks.json` can be created in the project folder

## 📖 Learning Resources

- [Flask Documentation](https://flask.palletsprojects.com/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [CSS Tricks](https://css-tricks.com/)
- [JavaScript.info](https://javascript.info/)

## 📝 License

This project is open source and available for educational purposes.

---

**Happy Task Planning! 🎉**
