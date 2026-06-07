const alertContainer = document.getElementById('alertContainer');

function showNotification(message, type = 'success') {
  alertContainer.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('https://educonnect-backend-c6jz.onrender.com/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('user', JSON.stringify(data.user));

      showNotification(
        'Login successful. Redirecting to your dashboard...',
        'success'
      );

      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 900);
    } else {
      showNotification(
        data.message || 'Login failed. Please try again.',
        'danger'
      );
    }
  } catch (error) {
    console.error('Login Error:', error);

    showNotification(
      'Unable to connect to the server. Please try again later.',
      'danger'
    );
  }
});
