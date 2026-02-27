// frontend/js/courses.js

document.addEventListener('DOMContentLoaded', async () => {
    setupNavLinks();
    await loadAllCourses();
});

function setupNavLinks() {
    const navLinks = document.getElementById('navLinksAuth');

    // Add theme toggle always
    let html = `
        <button id="themeToggle" class="theme-toggle" aria-label="Toggle Theme">
            <span id="themeIcon"></span>
        </button>
    `;

    if (isAuthenticated()) {
        html = `
            <a href="dashboard.html" class="btn btn-outline" style="margin-right: 1rem;">My Dashboard</a>
            ${html}
            <button onclick="logout()" class="btn btn-outline" style="border-color: var(--error-color); color: var(--error-color); margin-left: 1rem;">Logout</button>
        `;
    } else {
        html = `
            ${html}
            <a href="index.html" class="btn btn-primary" style="margin-left: 1rem;">Sign In</a>
        `;
    }
    navLinks.innerHTML = html;

    // re-attach theme event listener as we've replaced the button DOM element
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
        // Theme init depends on theme.js running first, sync the icon immediately
        updateThemeIcon(document.documentElement.getAttribute('data-theme'));
        themeBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }
}

async function loadAllCourses() {
    const loading = document.getElementById('loading');
    const grid = document.getElementById('coursesGrid');

    // Make public API call fetching course list
    const response = await fetchAPI('/courses/courses/', { requireAuth: false });

    loading.style.display = 'none';

    if (response.ok) {
        // The API uses PageNumberPagination, so the array is in response.data.results
        const courses = response.data.results || response.data; // fallback for non-paginated
        if (!courses || courses.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">No courses available at the moment. Please check back later.</p>';
        } else {
            renderCourseCards(courses, grid);
        }
        grid.style.display = 'grid';
    } else {
        grid.innerHTML = `<p style="color: var(--error-color); text-align: center; grid-column: 1/-1;">Failed to load courses: ${response.data.detail || 'Server error'}</p>`;
        grid.style.display = 'block';
    }
}

function renderCourseCards(courses, container) {
    let html = '';
    courses.forEach(course => {
        // Assume backend brings price & title
        const priceDisplay = course.price > 0 ? `$${course.price}` : 'Free';
        const levelDisplay = course.level || 'Beginner';

        html += `
        <div class="card">
            <div class="card-header">
                <h3>${course.title || 'Course Details'}</h3>
            </div>
            <div class="card-body">
                <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
                    <span class="badge" style="background-color: var(--bg-color); color: var(--text-primary)">
                        ${levelDisplay}
                    </span>
                    <span class="badge" style="background-color: rgba(16, 185, 129, 0.1); color: var(--success-color);">
                        ${priceDisplay}
                    </span>
                </div>
                
                <p class="card-text">${course.description ? course.description.substring(0, 100) + '...' : 'A journey to master new skills.'}</p>
                
                <button onclick="enrollCourse(${course.id})" class="btn btn-primary" style="width: 100%;">Enroll Now</button>
            </div>
        </div>
        `;
    });
    container.innerHTML = html;
}

async function enrollCourse(courseId) {
    if (!isAuthenticated()) {
        const alertBox = document.getElementById('alertBox');
        alertBox.textContent = "Please Login or Register to enroll in courses.";
        alertBox.className = "alert alert-error show";
        setTimeout(() => { alertBox.className = "alert"; }, 4000);
        return;
    }

    // Requires auth
    const response = await fetchAPI('/enrollments/enroll/', {
        method: 'POST',
        body: { course: courseId }
    });

    const alertBox = document.getElementById('alertBox');
    if (response.ok) {
        alertBox.textContent = "Successfully enrolled! You can find the course in your Dashboard.";
        alertBox.className = "alert alert-success show";
    } else {
        alertBox.textContent = response.data.detail || response.data.error || "Failed to enroll. You might already be enrolled.";
        alertBox.className = "alert alert-error show";
    }

    // Auto-hide alert
    setTimeout(() => { alertBox.className = "alert"; }, 4000);
}
