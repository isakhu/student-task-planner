# Import necessary Flask modules
from flask import Flask, render_template, request, jsonify
import json
import os
from datetime import datetime

# Create a Flask application instance
# __name__ tells Flask where to find templates and static files
app = Flask(__name__)

# Define the path for our JSON file where tasks will be saved
TASKS_FILE = 'tasks.json'

# Helper function to load tasks from the JSON file
def load_tasks():
    """
    Load tasks from the JSON file.
    If the file doesn't exist, return an empty list.
    """
    if os.path.exists(TASKS_FILE):
        with open(TASKS_FILE, 'r') as file:
            return json.load(file)
    return []

# Helper function to save tasks to the JSON file
def save_tasks(tasks):
    """
    Save the tasks list to the JSON file.
    This persists data even after the server restarts.
    """
    with open(TASKS_FILE, 'w') as file:
        json.dump(tasks, file, indent=4)

# Route for the home page
@app.route('/')
def index():
    """
    This route handles requests to the home page (/).
    It renders the index.html template.
    Flask automatically looks for templates in the 'templates' folder.
    """
    return render_template('index.html')

# API route to get all tasks
@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    """
    This route returns all tasks as JSON.
    JavaScript will fetch this data to display tasks on the page.
    """
    tasks = load_tasks()
    return jsonify(tasks)

# API route to add a new task
@app.route('/api/tasks', methods=['POST'])
def add_task():
    """
    This route receives task data from the frontend,
    adds it to our tasks list, and saves it.
    """
    # Get JSON data sent from JavaScript
    task_data = request.get_json()
    
    # Load existing tasks
    tasks = load_tasks()
    
    # Create a new task with a unique ID
    new_task = {
        'id': len(tasks) + 1,  # Simple ID generation
        'title': task_data.get('title'),
        'deadline': task_data.get('deadline'),
        'completed': False,
        'created_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }
    
    # Add the new task to the list
    tasks.append(new_task)
    
    # Save to file
    save_tasks(tasks)
    
    # Return the new task as JSON
    return jsonify(new_task), 201

# API route to update a task (mark as completed/uncompleted)
@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    """
    This route updates a specific task.
    The task_id comes from the URL.
    """
    tasks = load_tasks()
    
    # Find the task with the matching ID
    for task in tasks:
        if task['id'] == task_id:
            # Update the completed status
            task_data = request.get_json()
            task['completed'] = task_data.get('completed', task['completed'])
            save_tasks(tasks)
            return jsonify(task)
    
    # If task not found, return error
    return jsonify({'error': 'Task not found'}), 404

# API route to delete a task
@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    """
    This route deletes a task with the specified ID.
    """
    tasks = load_tasks()
    
    # Filter out the task to delete
    tasks = [task for task in tasks if task['id'] != task_id]
    
    save_tasks(tasks)
    return jsonify({'message': 'Task deleted successfully'})

# Run the Flask application
if __name__ == '__main__':
    # debug=True enables auto-reload and better error messages
    # This should be False in production
    # For deployment, use environment variable to control debug mode
    import os
    debug_mode = os.environ.get('FLASK_DEBUG', 'True') == 'True'
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=debug_mode, host='0.0.0.0', port=port)
