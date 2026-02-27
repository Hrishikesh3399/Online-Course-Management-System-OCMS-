from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.views.decorators.cache import cache_page

from .models import Review
from courses.models import Course
from enrollments.models import Enrollment
from .serializers import ReviewSerializer

@cache_page(60)
@api_view(['GET', 'POST'])
def course_reviews(request, course_id):
    try:
        course = Course.objects.get(id=course_id)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=404)

    if request.method == 'GET':
        reviews = Review.objects.filter(course=course)
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=401)
            
        # Ensure student is enrolled
        if not Enrollment.objects.filter(student=request.user, course=course).exists():
            return Response({'error': 'Must be enrolled to review'}, status=403)
            
        # Ensure only one review per student per course
        if Review.objects.filter(student=request.user, course=course).exists():
            return Response({'error': 'You have already reviewed this course'}, status=400)
            
        serializer = ReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(student=request.user, course=course)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_reviews(request):
    reviews = Review.objects.filter(student=request.user)
    serializer = ReviewSerializer(reviews, many=True)
    return Response(serializer.data)
