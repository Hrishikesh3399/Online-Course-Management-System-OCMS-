from django.urls import path
from .views import course_list, course_create, course_detail, category_list, instructor_courses

urlpatterns = [
    path('courses/', course_list),
    path('courses/create/', course_create),
    path('courses/<int:id>/', course_detail),
    path('categories/', category_list),
    path('instructor/courses/', instructor_courses),
]
