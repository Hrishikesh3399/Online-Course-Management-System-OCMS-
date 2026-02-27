Online Course Management System (OCMS)
Detailed Wireframe & Project Blueprint
1. Project Overview
Online Course Management System (OCMS) is a backend-driven LMS platform built using Django
REST Framework. The system allows students to enroll in courses, instructors to manage course
content, and admins to control the entire platform. Authentication is handled using JWT, and
performance is optimized using Redis caching.
2. Tech Stack
• Backend: Django, Django REST Framework
• Authentication: JWT (Access & Refresh Tokens)
• Database: PostgreSQL
• Caching: Redis
• Frontend: HTML, CSS, JavaScript
3. Django Project Structure
• ocms/ (Main Django Project)
• accounts/ – User management, JWT authentication, roles
• courses/ – Course, category, modules, lectures
• enrollments/ – Course enrollment & progress tracking
• reviews/ – Course ratings & feedback
• dashboard/ – Admin analytics APIs
Each app must have its own models.py, serializers.py, views.py, urls.py, and admin.py.
4. Apps Description (What Each App Does)
4.1 accounts App
• Custom User Model with roles: Student, Instructor, Admin
• JWT Login & Registration APIs
• Token refresh & logout
• Role-based permissions
4.2 courses App
• Course CRUD operations
• Category management
• Modules and lectures under courses
• Public course listing APIs (cached)
4.3 enrollments App
• Student course enrollment
• Prevent duplicate enrollments
• Progress calculation
• Completion status
4.4 reviews App
• Course ratings and comments
• One review per student per course
• Average rating calculation
4.5 dashboard App
• Admin analytics APIs
• Total students, courses, enrollments
• Top enrolled courses (Redis cached)
5. URL Design (urls.py per app)
accounts/urls.py
• /api/auth/register/
• /api/auth/login/
• /api/auth/refresh/
• /api/auth/logout/
• /api/auth/profile/
courses/urls.py
• /api/courses/
• /api/courses//
• /api/categories/
• /api/instructor/courses/
enrollments/urls.py
• /api/enroll/
• /api/my-courses/
• /api/course//progress/
reviews/urls.py
• /api/courses//reviews/
• /api/reviews/my/
dashboard/urls.py
• /api/admin/analytics/
• /api/admin/top-courses/
6. Page-wise Wireframes (Functional View)
6.1 Login Page
• Email field
• Password field
• Login button
• JWT token received on success
6.2 Student Dashboard
• List of enrolled courses
• Progress bar for each course
• Continue learning button
6.3 Course Listing Page
• Course cards
• Filter by category & level
• Sorting by price & popularity
• Pagination
6.4 Course Detail Page
• Course overview
• Instructor info
• Enroll button
• Lecture list (locked if not enrolled)
6.5 Instructor Dashboard
• Create new course
• Manage existing courses
• View enrolled students count
6.6 Admin Dashboard
• Total users
• Total courses
• Total enrollments
• Platform insights
7. Rules & Constraints for Students
• JWT is mandatory for protected APIs
• Redis caching must be used for public endpoints
• Pagination, filtering, and ordering are compulsory
• PostgreSQL must be used as the database
• No React – only HTML, CSS, JavaScript
8. Evaluation Criteria
• Correct API design – 30%
• JWT & permissions – 20%
• Redis caching – 15%
• Database design – 15%
• Code quality & structure – 20%
