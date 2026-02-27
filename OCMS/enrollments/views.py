from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Enrollment, Progress
from courses.models import Course
from .serializers import EnrollmentSerializer, ProgressSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enroll_course(request):
    course_id = request.data.get('course_id')
    try:
        course = Course.objects.get(id=course_id)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=404)
        
    if Enrollment.objects.filter(student=request.user, course=course).exists():
        return Response({'error': 'Already enrolled'}, status=400)
        
    enrollment = Enrollment.objects.create(student=request.user, course=course)
    Progress.objects.create(enrollment=enrollment)
    
    serializer = EnrollmentSerializer(enrollment)
    return Response(serializer.data, status=201)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_courses(request):
    enrollments = Enrollment.objects.filter(student=request.user)
    serializer = EnrollmentSerializer(enrollments, many=True)
    return Response(serializer.data)

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def course_progress(request, course_id):
    try:
        enrollment = Enrollment.objects.get(student=request.user, course_id=course_id)
        progress = enrollment.progress
    except Enrollment.DoesNotExist:
        return Response({'error': 'Not enrolled'}, status=404)
        
    if request.method == 'GET':
        serializer = ProgressSerializer(progress)
        return Response(serializer.data)
        
    if request.method == 'PATCH':
        completed_lectures = request.data.get('completed_lectures')
        if completed_lectures is not None:
            progress.completed_lectures = completed_lectures
            # Basic logic: if total lectures equals completed, it's completed.
            total_lectures = enrollment.course.modules.aggregate(
                total=models.Count('lectures')
            )['total']
            
            if progress.completed_lectures >= total_lectures:
                progress.is_completed = True
                
            progress.save()
            
        serializer = ProgressSerializer(progress)
        return Response(serializer.data)
