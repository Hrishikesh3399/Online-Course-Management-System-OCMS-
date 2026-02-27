from django.db import models
from django.conf import settings

class Category(models.Model):
    name = models.CharField(max_length=150)
    description = models.TextField()

    def __str__(self):
        return self.name

class Course(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    category = models.ForeignKey(Category, related_name='courses', on_delete=models.SET_NULL, null=True)
    instructor = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='taught_courses', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Module(models.Model):
    course = models.ForeignKey(Course, related_name='modules', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.course.title} - {self.title}"

class Lecture(models.Model):
    module = models.ForeignKey(Module, related_name='lectures', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    video_url = models.URLField(max_length=500, blank=True, null=True)

    def __str__(self):
        return self.title
