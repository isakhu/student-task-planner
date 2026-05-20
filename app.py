from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from functools import wraps
import os

app = Flask(__name__)

# Secret key for session management
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')

# SQLite database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///tasks.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# ─── Database Models ──────────────────────────────────────────────────────────

class User(db.Model):
    id       = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email    = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    tasks    = db.relationship('Task', backref='user', lazy=True, cascade='all, delete-orphan')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Task(db.Model):
    id         = db.Column(db.Integer, primary_key=True)
    title      = db.Column(db.String(200), nullable=False)
    deadline   = db.Column(db.String(20), nullable=False)
    category   = db.Column(db.String(50), default='General')
    priority   = db.Column(db.String(20), default='Medium')
    completed  = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id    = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def to_dict(self):
        return {
            'id':         self.id,
            'title':      self.title,
            'deadline':   self.deadline,
            'category':   self.category,
            'priority':   self.priority,
            'completed':  self.completed,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }

# ─── Auth Decorator ───────────────────────────────────────────────────────────

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Unauthorized'}), 401
        return f(*args, **kwargs)
    return decorated

# ─── Page Routes ──────────────────────────────────────────────────────────────

@app.route('/')
def index():
    if 'user_id' in session:
        return render_template('index.html')
    return redirect(url_for('auth_page'))

@app.route('/auth')
def auth_page():
    if 'user_id' in session:
        return redirect(url_for('index'))
    return render_template('auth.html')

# ─── Auth API ─────────────────────────────────────────────────────────────────

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username', '').strip()
    email    = data.get('email', '').strip()
    password = data.get('password', '')

    if not username or not email or not password:
        return jsonify({'error': 'All fields are required'}), 400
    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400
    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already taken'}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 400

    user = User(
        username=username,
        email=email,
        password=generate_password_hash(password)
    )
    db.session.add(user)
    db.session.commit()

    session['user_id'] = user.id
    session['username'] = user.username
    return jsonify({'message': 'Account created!', 'username': user.username}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '')

    user = User.query.filter_by(username=username).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({'error': 'Invalid username or password'}), 401

    session['user_id'] = user.id
    session['username'] = user.username
    return jsonify({'message': 'Logged in!', 'username': user.username})

@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logged out'})

@app.route('/api/me')
@login_required
def me():
    return jsonify({'username': session.get('username')})

# ─── Tasks API ────────────────────────────────────────────────────────────────

@app.route('/api/tasks', methods=['GET'])
@login_required
def get_tasks():
    search   = request.args.get('search', '').lower()
    category = request.args.get('category', '')
    priority = request.args.get('priority', '')
    status   = request.args.get('status', '')

    query = Task.query.filter_by(user_id=session['user_id'])

    if search:
        query = query.filter(Task.title.ilike(f'%{search}%'))
    if category:
        query = query.filter_by(category=category)
    if priority:
        query = query.filter_by(priority=priority)
    if status == 'completed':
        query = query.filter_by(completed=True)
    elif status == 'pending':
        query = query.filter_by(completed=False)

    tasks = query.order_by(Task.created_at.desc()).all()
    return jsonify([t.to_dict() for t in tasks])

@app.route('/api/tasks', methods=['POST'])
@login_required
def add_task():
    data = request.get_json()
    if not data.get('title') or not data.get('deadline'):
        return jsonify({'error': 'Title and deadline are required'}), 400

    task = Task(
        title    = data['title'].strip(),
        deadline = data['deadline'],
        category = data.get('category', 'General'),
        priority = data.get('priority', 'Medium'),
        user_id  = session['user_id']
    )
    db.session.add(task)
    db.session.commit()
    return jsonify(task.to_dict()), 201

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
@login_required
def update_task(task_id):
    task = Task.query.filter_by(id=task_id, user_id=session['user_id']).first()
    if not task:
        return jsonify({'error': 'Task not found'}), 404

    data = request.get_json()
    if 'completed' in data:
        task.completed = data['completed']
    if 'title' in data:
        task.title = data['title']
    if 'priority' in data:
        task.priority = data['priority']

    db.session.commit()
    return jsonify(task.to_dict())

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
@login_required
def delete_task(task_id):
    task = Task.query.filter_by(id=task_id, user_id=session['user_id']).first()
    if not task:
        return jsonify({'error': 'Task not found'}), 404

    db.session.delete(task)
    db.session.commit()
    return jsonify({'message': 'Task deleted'})

@app.route('/api/stats')
@login_required
def get_stats():
    tasks     = Task.query.filter_by(user_id=session['user_id']).all()
    total     = len(tasks)
    completed = sum(1 for t in tasks if t.completed)
    pending   = total - completed
    overdue   = sum(1 for t in tasks if not t.completed and t.deadline < datetime.now().strftime('%Y-%m-%d'))

    # Progress per category
    categories = {}
    for t in tasks:
        if t.category not in categories:
            categories[t.category] = {'total': 0, 'completed': 0}
        categories[t.category]['total'] += 1
        if t.completed:
            categories[t.category]['completed'] += 1

    return jsonify({
        'total':      total,
        'completed':  completed,
        'pending':    pending,
        'overdue':    overdue,
        'categories': categories
    })

# ─── Init DB & Run ────────────────────────────────────────────────────────────

with app.app_context():
    db.create_all()

if __name__ == '__main__':
    debug_mode = os.environ.get('FLASK_DEBUG', 'True') == 'True'
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=debug_mode, host='0.0.0.0', port=port)
