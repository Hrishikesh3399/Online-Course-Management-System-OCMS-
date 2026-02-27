from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count
from django.views.decorators.cache import cache_page

from accounts.models import User
from courses.models import Course
from enrollments.models import Enrollment

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_analytics(request):
    if request.user.role != User.Role.ADMIN:
        return Response({'error': 'Admin access required'}, status=403)
        
    total_users = User.objects.count()
    total_students = User.objects.filter(role=User.Role.STUDENT).count()
    total_instructors = User.objects.filter(role=User.Role.INSTRUCTOR).count()
    
    total_courses = Course.objects.count()
    total_enrollments = Enrollment.objects.count()
    
    return Response({
        'total_users': total_users,
        'total_students': total_students,
        'total_instructors': total_instructors,
        'total_courses': total_courses,
        'total_enrollments': total_enrollments
    })

@cache_page(60 ) # Cache for 15 minutes
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def top_courses(request):
    if request.user.role != User.Role.ADMIN:
        return Response({'error': 'Admin access required'}, status=403)
        
    # Get top 5 courses by enrollment count
    top_courses = Course.objects.annotate(
        enrollment_count=Count('enrollments')
    ).order_by('-enrollment_count')[:5]
    
    data = []
    for course in top_courses:
        data.append({
            'id': course.id,
            'title': course.title,
            'enrollment_count': course.enrollment_count
        })
        
    return Response(data)
