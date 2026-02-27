from django.urls import path
from .views import admin_analytics, top_courses

urlpatterns = [
    path('analytics/', admin_analytics),
    path('top-courses/', top_courses),
]
