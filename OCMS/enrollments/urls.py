from django.urls import path
from .views import enroll_course, my_courses, course_progress

urlpatterns = [
    path('enroll/', enroll_course),
    path('my-courses/', my_courses),
    path('course/<int:course_id>/progress/', course_progress),
]
