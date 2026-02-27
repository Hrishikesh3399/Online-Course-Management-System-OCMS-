from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    # 1. Role Definitions
    class Role(models.TextChoices):
        STUDENT = 'STUDENT', 'Student'
        INSTRUCTOR = 'INSTRUCTOR', 'Instructor'
        ADMIN = 'ADMIN', 'Admin'

    # 2. Custom Identity Fields
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=100)
    age = models.IntegerField(null=True, blank=True)
    role = models.CharField(
        max_length=15, 
        choices=Role.choices, 
        default=Role.STUDENT
    )

    # 3. Timestamps
    # date_joined is already provided by AbstractUser (acts as created_at)
    updated_at = models.DateTimeField(auto_now=True) 

    # 4. Authentication Config
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'full_name']

    def __str__(self):
        return f"{self.email} ({self.role})"