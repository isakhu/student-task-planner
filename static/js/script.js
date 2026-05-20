// ─── State ────────────────────────────────────────────
let activeFilter = '';
let searchTimer  = null;

// ─── Boot ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadUser();
  loadStats();
  loadTasks();
  initTheme();
  initModal();
  initSearch();
  initFilters();
  initSidebar();
  // Set min date on deadline input
  document.getElementById('tDeadline').min = new Date().toISOString().split('T')[0];
});

// ─── User ─────────────────────────────────────────────
async function loadUser() {
  const res = await fetch('/api/me');
  if (!res.ok) { window.location.href = '/auth'; return; }
  const { username } = await res.json();
  document.getElementById('sbName').textContent   = username;
  document.getElementById('sbAvatar').textContent = username[0].toUpperCase();
}

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await fetch('/api/logout', { method: 'POST' });
  window.location.href = '/auth';
});

// ─── Theme ────────────────────────────────────────────
function initTheme() {
  if (localStorage.getItem('dark') === '1') applyDark(true);
}
function applyDark(on) {
  document.body.classList.toggle('dark', on);
  document.getElementById('darkBtn').innerHTML = on
    ? '<i class="fas fa-sun"></i>'
    : '<i class="fas fa-moon"></i>';
}
document.getElementById('darkBtn').addEventListener('click', () => {
  const on = !document.body.classList.contains('dark');
  applyDark(on);
  localStorage.setItem('dark', on ? '1' : '0');
});

// ─── Sidebar ──────────────────────────────────────────
function initSidebar() {
  document.getElementById('menuBtn').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });
  document.addEventListener('click', e => {
    const sb = document.getElementById('sidebar');
    if (sb.classList.contains('open') &&
        !sb.contains(e.target) &&
        e.target !== document.getElementById('menuBtn')) {
      sb.classList.remove('open');
    }
  });
}

window.setFilter = function(btn, filter) {
  document.querySelectorAll('.sb-item').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  activeFilter = filter;
  const titles = {
    '':                 ['All Tasks',       'Manage and track your study tasks'],
    'status=pending':   ['Pending Tasks',   'Tasks you still need to complete'],
    'status=completed': ['Completed Tasks', 'Tasks you have finished'],
    'priority=High':    ['High Priority',   'Your most urgent tasks'],
    'status=overdue':   ['Overdue Tasks',   'Tasks past their deadline'],
  };
  const [title, sub] = titles[filter] || ['Tasks', ''];
  document.getElementById('pageTitle').textContent    = title;
  document.getElementById('pageSubtitle').textContent = sub;
  loadTasks();
  document.getElementById('sidebar').classList.remove('open');
};

// ─── Modal ────────────────────────────────────────────
function initModal() {
  const open  = () => document.getElementById('overlay').classList.add('show');
  const close = () => {
    document.getElementById('overlay').classList.remove('show');
    document.getElementById('taskForm').reset();
  };
  document.getElementById('openModal').addEventListener('click', open);
  document.getElementById('closeModal').addEventListener('click', close);
  document.getElementById('cancelModal').addEventListener('click', close);
  document.getElementById('overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('overlay')) close();
  });

  document.getElementById('taskForm').addEventListener('submit', async e => {
    e.preventDefault();
    const body = {
      title:    document.getElementById('tTitle').value.trim(),
      deadline: document.getElementById('tDeadline').value,
      priority: document.getElementById('tPriority').value,
      category: document.getElementById('tCategory').value,
    };
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) { toast('Error adding task', 'error'); return; }
    close();
    loadTasks();
    loadStats();
    toast('Task added! 🎉', 'success');
  });
}

// ─── Search & Filters ─────────────────────────────────
function initSearch() {
  document.getElementById('searchInput').addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(loadTasks, 280);
  });
}
function initFilters() {
  document.getElementById('fPriority').addEventListener('change', loadTasks);
  document.getElementById('fCategory').addEventListener('change', loadTasks);
}

function buildQuery() {
  const p = new URLSearchParams();
  if (activeFilter) {
    const [k, v] = activeFilter.split('=');
    p.set(k, v);
  }
  const s = document.getElementById('searchInput').value.trim();
  const pr = document.getElementById('fPriority').value;
  const ca = document.getElementById('fCategory').value;
  if (s)  p.set('search', s);
  if (pr) p.set('priority', pr);
  if (ca) p.set('category', ca);
  return p.toString() ? '?' + p : '';
}

// ─── Load & Render Tasks ──────────────────────────────
async function loadTasks() {
  const res   = await fetch('/api/tasks' + buildQuery());
  const tasks = await res.json();
  renderTasks(tasks);
}

function renderTasks(tasks) {
  const list  = document.getElementById('taskList');
  const empty = document.getElementById('emptyState');
  list.innerHTML = '';

  document.getElementById('taskCountBadge').textContent =
    `${tasks.length} task${tasks.length !== 1 ? 's' : ''}`;

  if (!tasks.length) { empty.classList.add('show'); return; }
  empty.classList.remove('show');
  tasks.forEach(t => list.appendChild(makeCard(t)));
}

function makeCard(t) {
  const div = document.createElement('div');
  div.className = 'task-card' + (t.completed ? ' done' : '');

  const { label, cls } = deadlineInfo(t.deadline);

  div.innerHTML = `
    <div class="check" onclick="toggleTask(${t.id},${!t.completed})">
      ${t.completed ? '<i class="fas fa-check"></i>' : ''}
    </div>
    <div class="task-body">
      <div class="task-title">${esc(t.title)}</div>
      <div class="task-tags">
        <span class="badge badge-date ${cls}"><i class="fas fa-calendar-alt"></i> ${label}</span>
        <span class="badge badge-pri-${t.priority}">${t.priority}</span>
        <span class="badge badge-cat">${t.category}</span>
      </div>
    </div>
    <div class="task-actions">
      <button class="task-btn" onclick="deleteTask(${t.id})" title="Delete">
        <i class="fas fa-trash"></i>
      </button>
    </div>`;
  return div;
}

function deadlineInfo(dateStr) {
  const d    = new Date(dateStr + 'T00:00:00');
  const now  = new Date(); now.setHours(0,0,0,0);
  const diff = Math.ceil((d - now) / 86400000);
  const fmt  = d.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });

  if (diff < 0)  return { label: `Overdue · ${fmt}`,   cls: 'overdue' };
  if (diff === 0) return { label: `Due today · ${fmt}`, cls: 'today' };
  if (diff === 1) return { label: `Tomorrow · ${fmt}`,  cls: 'soon' };
  if (diff <= 3)  return { label: `${diff} days · ${fmt}`, cls: 'soon' };
  return { label: fmt, cls: '' };
}

// ─── Toggle / Delete ──────────────────────────────────
window.toggleTask = async function(id, completed) {
  await fetch(`/api/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed })
  });
  loadTasks(); loadStats();
  if (completed) toast('Task completed! 🎉', 'success');
};

window.deleteTask = async function(id) {
  if (!confirm('Delete this task?')) return;
  await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
  loadTasks(); loadStats();
  toast('Task deleted', 'info');
};

// ─── Stats ────────────────────────────────────────────
async function loadStats() {
  const res  = await fetch('/api/stats');
  const data = await res.json();

  countUp('sTotal',   data.total);
  countUp('sDone',    data.completed);
  countUp('sPending', data.pending);
  countUp('sOverdue', data.overdue);

  // Sidebar badges
  document.getElementById('cnt-all').textContent     = data.total;
  document.getElementById('cnt-pending').textContent = data.pending;
  document.getElementById('cnt-done').textContent    = data.completed;
  document.getElementById('cnt-overdue').textContent = data.overdue;

  renderProgress(data.categories);
  renderCatSidebar(data.categories);
}

function renderProgress(cats) {
  const grid = document.getElementById('progressGrid');
  grid.innerHTML = '';
  Object.entries(cats).forEach(([name, d]) => {
    const pct = d.total ? Math.round(d.completed / d.total * 100) : 0;
    const el  = document.createElement('div');
    el.className = 'prog-card';
    el.innerHTML = `
      <div class="prog-head">
        <span class="prog-name">${name}</span>
        <span class="prog-pct">${pct}%</span>
      </div>
      <div class="prog-track">
        <div class="prog-fill" style="width:${pct}%"></div>
      </div>
      <p class="prog-sub">${d.completed} of ${d.total} done</p>`;
    grid.appendChild(el);
  });
}

function renderCatSidebar(cats) {
  const sec = document.getElementById('sbCats');
  sec.innerHTML = '<p class="sb-label">Categories</p>';
  Object.entries(cats).forEach(([name, d]) => {
    const btn = document.createElement('button');
    btn.className = 'sb-item';
    btn.innerHTML = `<i class="fas fa-tag"></i> ${name} <span class="sb-count">${d.total}</span>`;
    btn.onclick = () => {
      document.getElementById('fCategory').value = name;
      loadTasks();
      document.getElementById('sidebar').classList.remove('open');
    };
    sec.appendChild(btn);
  });
}

// ─── Helpers ──────────────────────────────────────────
function countUp(id, target) {
  const el = document.getElementById(id);
  const start = parseInt(el.textContent) || 0;
  const diff  = target - start;
  let   step  = 0;
  const timer = setInterval(() => {
    step++;
    el.textContent = Math.round(start + diff * step / 20);
    if (step >= 20) clearInterval(timer);
  }, 16);
}

function toast(msg, type = 'info') {
  const el = document.getElementById('toast');
  const icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle' };
  el.innerHTML = `<i class="fas ${icons[type]}"></i> ${msg}`;
  el.className = `toast ${type} show`;
  setTimeout(() => el.classList.remove('show'), 3000);
}

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}
