from django.urls import path
from .views import course_reviews, my_reviews

urlpatterns = [
    path('courses/<int:course_id>/reviews/', course_reviews),
    path('reviews/my/', my_reviews),
]
