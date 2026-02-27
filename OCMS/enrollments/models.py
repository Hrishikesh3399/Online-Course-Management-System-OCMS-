from django.db import models
from django.conf import settings
from courses.models import Course

class Enrollment(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='enrollments', on_delete=models.CASCADE)
    course = models.ForeignKey(Course, related_name='enrollments', on_delete=models.CASCADE)
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'course')

    def __str__(self):
        return f"{self.student.email} -> {self.course.title}"

class Progress(models.Model):
    enrollment = models.OneToOneField(Enrollment, related_name='progress', on_delete=models.CASCADE)
    completed_lectures = models.IntegerField(default=0)
    is_completed = models.BooleanField(default=False)

    def __str__(self):
        return f"Progress for {self.enrollment}"
