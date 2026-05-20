// ─── State ────────────────────────────────────────────────────────────────────
let activeFilter = '';
let searchTimeout = null;

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    loadUser();
    loadTasks();
    loadStats();
    initDarkMode();
    initModal();
    initSearch();
    initFilters();
    initSidebar();
});

// ─── User ─────────────────────────────────────────────────────────────────────
async function loadUser() {
    try {
        const res  = await fetch('/api/me');
        if (!res.ok) { window.location.href = '/auth'; return; }
        const data = await res.json();
        document.getElementById('sidebarUsername').textContent = data.username;
        document.getElementById('userAvatar').textContent = data.username[0].toUpperCase();
    } catch {
        window.location.href = '/auth';
    }
}

document.getElementById('logoutBtn').addEventListener('click', async () => {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/auth';
});

// ─── Dark Mode ────────────────────────────────────────────────────────────────
function initDarkMode() {
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        document.getElementById('darkModeToggle').innerHTML = '<i class="fas fa-sun"></i>';
    }
}

document.getElementById('darkModeToggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const dark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', dark);
    document.getElementById('darkModeToggle').innerHTML = dark
        ? '<i class="fas fa-sun"></i>'
        : '<i class="fas fa-moon"></i>';
});

// ─── Sidebar (mobile) ─────────────────────────────────────────────────────────
function initSidebar() {
    document.getElementById('menuToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });

    // Nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', e => {
            e.preventDefault();
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            activeFilter = item.dataset.filter || '';
            loadTasks();
            document.getElementById('sidebar').classList.remove('open');
        });
    });
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function initModal() {
    const overlay = document.getElementById('modalOverlay');
    const open    = () => overlay.classList.add('show');
    const close   = () => overlay.classList.remove('show');

    document.getElementById('openModalBtn').addEventListener('click', open);
    document.getElementById('closeModalBtn').addEventListener('click', close);
    document.getElementById('cancelBtn').addEventListener('click', close);

    overlay.addEventListener('click', e => {
        if (e.target === overlay) close();
    });

    // Set min date to today
    document.getElementById('taskDeadline').min = new Date().toISOString().split('T')[0];

    document.getElementById('taskForm').addEventListener('submit', async e => {
        e.preventDefault();
        const title    = document.getElementById('taskTitle').value.trim();
        const deadline = document.getElementById('taskDeadline').value;
        const priority = document.getElementById('taskPriority').value;
        const category = document.getElementById('taskCategory').value;

        if (!title || !deadline) return;

        try {
            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, deadline, priority, category })
            });

            if (!res.ok) throw new Error();

            document.getElementById('taskForm').reset();
            close();
            loadTasks();
            loadStats();
            showToast('Task added! 🎉', 'success');
        } catch {
            showToast('Error adding task', 'error');
        }
    });
}

// ─── Search ───────────────────────────────────────────────────────────────────
function initSearch() {
    document.getElementById('searchInput').addEventListener('input', e => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => loadTasks(), 300);
    });
}

// ─── Filters ──────────────────────────────────────────────────────────────────
function initFilters() {
    document.getElementById('filterPriority').addEventListener('change', loadTasks);
    document.getElementById('filterCategory').addEventListener('change', loadTasks);
}

// ─── Build query string ───────────────────────────────────────────────────────
function buildQuery() {
    const params = new URLSearchParams();

    // Active filter from sidebar
    if (activeFilter) {
        const [key, val] = activeFilter.split('=');
        params.set(key, val);
    }

    const search   = document.getElementById('searchInput').value.trim();
    const priority = document.getElementById('filterPriority').value;
    const category = document.getElementById('filterCategory').value;

    if (search)   params.set('search', search);
    if (priority) params.set('priority', priority);
    if (category) params.set('category', category);

    return params.toString() ? '?' + params.toString() : '';
}

// ─── Load Tasks ───────────────────────────────────────────────────────────────
async function loadTasks() {
    try {
        const res   = await fetch('/api/tasks' + buildQuery());
        const tasks = await res.json();
        renderTasks(tasks);
    } catch {
        showToast('Error loading tasks', 'error');
    }
}

// ─── Render Tasks ─────────────────────────────────────────────────────────────
function renderTasks(tasks) {
    const list  = document.getElementById('tasksList');
    const empty = document.getElementById('emptyState');

    list.innerHTML = '';

    if (tasks.length === 0) {
        empty.classList.add('show');
        document.getElementById('taskCount').textContent = '0 tasks';
        return;
    }

    empty.classList.remove('show');
    document.getElementById('taskCount').textContent = `${tasks.length} task${tasks.length !== 1 ? 's' : ''}`;

    tasks.forEach(task => {
        const card = createTaskCard(task);
        list.appendChild(card);
    });
}

// ─── Create Task Card ─────────────────────────────────────────────────────────
function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = 'task-card' + (task.completed ? ' completed' : '');

    const { text: deadlineText, cls: deadlineCls } = formatDeadline(task.deadline);

    card.innerHTML = `
        <div class="task-check" onclick="toggleTask(${task.id}, ${!task.completed})">
            ${task.completed ? '<i class="fas fa-check"></i>' : ''}
        </div>
        <div class="task-body">
            <div class="task-title">${escapeHtml(task.title)}</div>
            <div class="task-meta">
                <span class="${deadlineCls}">
                    <i class="fas fa-calendar-alt"></i> ${deadlineText}
                </span>
                <span class="priority-badge priority-${task.priority}">${task.priority}</span>
                <span class="category-badge">${task.category}</span>
            </div>
        </div>
        <div class="task-actions">
            <button class="btn-delete" onclick="deleteTask(${task.id})" title="Delete">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;

    return card;
}

// ─── Format Deadline ──────────────────────────────────────────────────────────
function formatDeadline(dateStr) {
    const deadline = new Date(dateStr + 'T00:00:00');
    const today    = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.ceil((deadline - today) / 86400000);

    const formatted = deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    if (diff < 0)  return { text: `Overdue · ${formatted}`,   cls: 'deadline-overdue' };
    if (diff === 0) return { text: `Due today · ${formatted}`, cls: 'deadline-today' };
    if (diff === 1) return { text: `Tomorrow · ${formatted}`,  cls: 'deadline-tomorrow' };
    return { text: `${diff} days · ${formatted}`, cls: '' };
}

// ─── Toggle Task ──────────────────────────────────────────────────────────────
async function toggleTask(id, completed) {
    try {
        await fetch(`/api/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed })
        });
        loadTasks();
        loadStats();
        if (completed) showToast('Task completed! 🎉', 'success');
    } catch {
        showToast('Error updating task', 'error');
    }
}

// ─── Delete Task ──────────────────────────────────────────────────────────────
async function deleteTask(id) {
    if (!confirm('Delete this task?')) return;
    try {
        await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
        loadTasks();
        loadStats();
        showToast('Task deleted', 'info');
    } catch {
        showToast('Error deleting task', 'error');
    }
}

// ─── Stats & Progress ─────────────────────────────────────────────────────────
async function loadStats() {
    try {
        const res  = await fetch('/api/stats');
        const data = await res.json();

        animateNumber('totalTasks',     data.total);
        animateNumber('completedTasks', data.completed);
        animateNumber('pendingTasks',   data.pending);
        animateNumber('overdueTasks',   data.overdue);

        renderProgress(data.categories);
        renderCategorySidebar(data.categories);
    } catch {}
}

function renderProgress(categories) {
    const section = document.getElementById('progressSection');
    section.innerHTML = '';

    Object.entries(categories).forEach(([name, data]) => {
        const pct = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
        const card = document.createElement('div');
        card.className = 'progress-card';
        card.innerHTML = `
            <div class="progress-card-header">
                <span>${name}</span>
                <span class="progress-pct">${pct}%</span>
            </div>
            <div class="progress-bar-track">
                <div class="progress-bar-fill" style="width: ${pct}%"></div>
            </div>
            <p class="progress-sub">${data.completed} of ${data.total} done</p>
        `;
        section.appendChild(card);
    });
}

function renderCategorySidebar(categories) {
    const container = document.getElementById('sidebarCategories');
    container.innerHTML = '<p class="sidebar-label">Categories</p>';

    Object.entries(categories).forEach(([name, data]) => {
        const item = document.createElement('a');
        item.href = '#';
        item.className = 'cat-item';
        item.innerHTML = `<span>${name}</span><span class="cat-badge">${data.total}</span>`;
        item.addEventListener('click', e => {
            e.preventDefault();
            document.getElementById('filterCategory').value = name;
            loadTasks();
        });
        container.appendChild(item);
    });
}

// ─── Animate Number ───────────────────────────────────────────────────────────
function animateNumber(id, target) {
    const el    = document.getElementById(id);
    const start = parseInt(el.textContent) || 0;
    const diff  = target - start;
    const steps = 20;
    let   step  = 0;

    const timer = setInterval(() => {
        step++;
        el.textContent = Math.round(start + (diff * step / steps));
        if (step >= steps) clearInterval(timer);
    }, 16);
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function showToast(msg, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.className = `toast ${type} show`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// ─── Escape HTML ──────────────────────────────────────────────────────────────
function escapeHtml(text) {
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
}
