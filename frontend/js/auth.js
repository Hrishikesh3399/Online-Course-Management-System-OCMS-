// frontend/js/auth.js

document.addEventListener('DOMContentLoaded', () => {
    // If already logged in, redirect to dashboard
    if (isAuthenticated()) {
        window.location.href = 'dashboard.html';
        return;
    }

    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
});

function switchThemeTab(tab) {
    const tabLogin = document.getElementById('tabLogin');
    const tabRegister = document.getElementById('tabRegister');
    const formLogin = document.getElementById('loginForm');
    const formRegister = document.getElementById('registerForm');
    const alertBox = document.getElementById('alertBox');

    alertBox.className = 'alert'; // clear alerts

    if (tab === 'login') {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        formLogin.classList.add('active');
        formRegister.classList.remove('active');
    } else {
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        formRegister.classList.add('active');
        formLogin.classList.remove('active');
    }
}

function showAlert(message, type) {
    const alertBox = document.getElementById('alertBox');
    alertBox.textContent = message;
    alertBox.className = `alert alert-${type} show`;
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const btn = e.target.querySelector('button');

    btn.disabled = true;
    btn.textContent = 'Signing in...';

    const response = await fetchAPI('/accounts/login/', {
        method: 'POST',
        body: { email, password },
        requireAuth: false // No token needed to login
    });

    btn.disabled = false;
    btn.textContent = 'Sign In';

    if (response.ok) {
        // Store tokens
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);

        // Let's assume the backend returns user details, if not we will fetch `/auth/profile/`
        // For now, redirect!
        window.location.href = 'dashboard.html';
    } else {
        showAlert(response.data.detail || 'Invalid credentials', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const role = document.getElementById('regRole').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regPasswordConfirm').value;

    if (password !== confirm) {
        showAlert("Passwords do not match.", 'error');
        return;
    }

    const btn = e.target.querySelector('button');
    btn.disabled = true;
    btn.textContent = 'Creating Account...';

    const response = await fetchAPI('/accounts/register/', {
        method: 'POST',
        body: {
            email,
            password,
            role
        },
        requireAuth: false
    });

    btn.disabled = false;
    btn.textContent = 'Create Account';

    if (response.ok) {
        showAlert('Registration successful! Please log in.', 'success');
        switchThemeTab('login'); // auto switch to login
    } else {
        const errorMsg = response.data.email ? response.data.email[0] : 'Registration failed. Check details.';
        showAlert(errorMsg, 'error');
    }
}
