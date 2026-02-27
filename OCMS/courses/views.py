from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.views.decorators.cache import cache_page

from accounts.models import User
from .models import Course, Category
from .serializers import CourseSerializer, CourseDetailSerializer, CategorySerializer

@cache_page(60) # Cache public list for 60 seconds
@api_view(['GET'])
@permission_classes([AllowAny])
def course_list(request):
    courses = Course.objects.all()
    
    # Filter
    category_id = request.query_params.get('category')
    level = request.query_params.get('level') # We could add level to model if strict, but generic filter is ok
    ordering = request.query_params.get('ordering')
    search = request.query_params.get('search')
    
    if category_id:
        courses = courses.filter(category_id=category_id)
    if search:
        courses = courses.filter(title__icontains=search)
    if ordering:
        courses = courses.order_by(ordering)
        
    paginator = PageNumberPagination()
    paginator.page_size = 10
    paginated_courses = paginator.paginate_queryset(courses, request)
    serializer = CourseSerializer(paginated_courses, many=True)
    return paginator.get_paginated_response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def course_create(request):
    if request.user.role != User.Role.INSTRUCTOR and request.user.role != User.Role.ADMIN:
        return Response({"error": "Only instructors can create courses"}, status=403)
        
    serializer = CourseSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(instructor=request.user)
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([AllowAny])
def course_detail(request, id):
    try:
        course = Course.objects.get(id=id)
    except Course.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)
        
    if request.method == 'GET':
        serializer = CourseDetailSerializer(course)
        return Response(serializer.data)
        
    # For PUT and DELETE, require instructor or admin
    if not request.user.is_authenticated or request.user.role not in [User.Role.INSTRUCTOR, User.Role.ADMIN]:
        return Response({'error': 'Unauthorized'}, status=403)
        
    # Ensure they own the course
    if request.user.role == User.Role.INSTRUCTOR and course.instructor != request.user:
        return Response({'error': 'Unauthorized'}, status=403)

    if request.method == 'PUT':
        serializer = CourseSerializer(course, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
        
    if request.method == 'DELETE':
        course.delete()
        return Response({'message': 'Deleted'}, status=204)

@cache_page(60)
@api_view(['GET'])
@permission_classes([AllowAny])
def category_list(request):
    categories = Category.objects.all()
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def instructor_courses(request):
    if request.user.role != User.Role.INSTRUCTOR:
        return Response({"error": "Not an instructor"}, status=403)
        
    courses = Course.objects.filter(instructor=request.user)
    serializer = CourseSerializer(courses, many=True)
    return Response(serializer.data)
