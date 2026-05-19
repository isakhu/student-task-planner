# 🎓 Student Task Planner

A modern web application built with Flask, HTML, CSS, and JavaScript to help students manage their tasks effectively.

## ✨ Features

- ✅ Add new tasks with deadlines
- 🗑️ Delete tasks
- ✔️ Mark tasks as completed/incomplete
- 📅 Task deadlines with countdown
- 🌙 Dark mode toggle
- 📱 Fully responsive design
- 💾 Persistent storage using JSON
- 📊 Dashboard with task statistics

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/student-task-planner.git
cd student-task-planner

# Install dependencies
pip install -r requirements.txt

# Run the application
python app.py
```

Visit `http://localhost:5000` in your browser.

## 📁 Project Structure

```
student-task-planner/
├── app.py                  # Flask backend
├── requirements.txt        # Python dependencies
├── templates/
│   └── index.html         # Main HTML template
└── static/
    ├── css/
    │   └── style.css      # Styling
    └── js/
        └── script.js      # Frontend JavaScript
```

## 🌐 Deployment

### Deploy to Render

1. Push your code to GitHub
2. Go to [Render.com](https://render.com) and sign up
3. Create a new Web Service
4. Connect your GitHub repository
5. Configure:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Instance Type**: Free

Your app will be live in minutes!

## 🛠️ Technologies Used

- **Backend**: Python Flask
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Storage**: JSON file-based storage
- **Deployment**: Gunicorn (production server)

## 📝 License

MIT License - feel free to use this project for learning and personal use.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
