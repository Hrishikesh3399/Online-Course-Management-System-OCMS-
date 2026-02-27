// frontend/js/dashboard.js

document.addEventListener('DOMContentLoaded', async () => {
    // Protected route logic
    if (!isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }

    await loadEnrolledCourses();
});

async function loadEnrolledCourses() {
    const loading = document.getElementById('loading');
    const grid = document.getElementById('enrolledGrid');

    // /api/enrollments/my-courses/ is the enrollment list endpoint
    const response = await fetchAPI('/enrollments/my-courses/');

    loading.style.display = 'none';

    if (response.ok) {
        const enrollments = response.data; // assume it's a list of enrollment objects
        if (enrollments.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 3rem;">You have not enrolled in any courses yet. <br><a href="courses.html" class="btn btn-primary" style="margin-top: 1rem;">Browse Courses</a></p>';
        } else {
            renderEnrolledCards(enrollments, grid);
        }
        grid.style.display = 'grid';
    } else {
        grid.innerHTML = `<p style="color: var(--error-color);">Failed to load enrollments: ${response.data.detail || 'Server error'}</p>`;
        grid.style.display = 'block';
    }
}

function renderEnrolledCards(enrollments, container) {
    let html = '';
    enrollments.forEach(enrollment => {
        const course = enrollment.course; // backend usually nests the course details
        const progress = enrollment.progress || 0; // Assume float 0.0 to 100.0

        html += `
        <div class="card">
            <div class="card-header">
                <h3>${course.title || 'Untitled Course'}</h3>
            </div>
            <div class="card-body">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem">
                    <span class="badge" style="background-color: var(--bg-color); color: var(--text-primary)">
                        Enrolled: ${new Date(enrollment.enrolled_at).toLocaleDateString()}
                    </span>
                    <span style="font-size: 0.8rem; font-weight: 600;">${progress}%</span>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${progress}%"></div>
                </div>
                
                <p class="card-text" style="margin-top: 1rem;">Continue where you left off and finish your learning journey.</p>
                
                <button class="btn btn-primary" style="width: 100%;">Continue Learning</button>
            </div>
        </div>
        `;
    });
    container.innerHTML = html;
}
