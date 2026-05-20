function switchTab(tab) {
  const isLogin = tab === 'login';
  document.getElementById('loginForm').classList.toggle('hidden', !isLogin);
  document.getElementById('regForm').classList.toggle('hidden', isLogin);
  document.getElementById('tabLogin').classList.toggle('active', isLogin);
  document.getElementById('tabReg').classList.toggle('active', !isLogin);
  document.getElementById('authErr').classList.remove('show');
}

function showErr(msg) {
  const el = document.getElementById('authErr');
  el.textContent = msg;
  el.classList.add('show');
}

document.getElementById('loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const res  = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: document.getElementById('lUser').value.trim(),
      password: document.getElementById('lPass').value
    })
  });
  const data = await res.json();
  if (!res.ok) { showErr(data.error); return; }
  window.location.href = '/';
});

document.getElementById('regForm').addEventListener('submit', async e => {
  e.preventDefault();
  const res  = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: document.getElementById('rUser').value.trim(),
      email:    document.getElementById('rEmail').value.trim(),
      password: document.getElementById('rPass').value
    })
  });
  const data = await res.json();
  if (!res.ok) { showErr(data.error); return; }
  window.location.href = '/';
});
