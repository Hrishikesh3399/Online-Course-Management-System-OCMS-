from rest_framework import serializers
from .models import Enrollment, Progress
from courses.serializers import CourseSerializer

class ProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Progress
        fields = '__all__'
        read_only_fields = ['enrollment']

class EnrollmentSerializer(serializers.ModelSerializer):
    course_detail = CourseSerializer(source='course', read_only=True)
    progress = ProgressSerializer(read_only=True)

    class Meta:
        model = Enrollment
        fields = ['id', 'student', 'course', 'course_detail', 'enrolled_at', 'progress']
        read_only_fields = ['student', 'enrolled_at']
