// Switch between login and register tabs
function switchTab(tab) {
    const loginForm    = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginTab     = document.getElementById('loginTab');
    const registerTab  = document.getElementById('registerTab');
    const error        = document.getElementById('authError');

    error.classList.remove('show');

    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
    } else {
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
    }
}

// Show error message
function showError(msg) {
    const el = document.getElementById('authError');
    el.textContent = msg;
    el.classList.add('show');
}

// Login form
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    try {
        const res  = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();

        if (!res.ok) { showError(data.error); return; }
        window.location.href = '/';
    } catch {
        showError('Connection error. Please try again.');
    }
});

// Register form
document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = document.getElementById('regUsername').value.trim();
    const email    = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;

    try {
        const res  = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        const data = await res.json();

        if (!res.ok) { showError(data.error); return; }
        window.location.href = '/';
    } catch {
        showError('Connection error. Please try again.');
    }
});
