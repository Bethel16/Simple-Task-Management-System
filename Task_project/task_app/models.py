from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)  # links the profile to the user
    profile_image = models.ImageField(upload_to='profile_pics/', default='default.jpg')  # store profile pics
    bio = models.TextField(blank=True, null=True)  # optional bio field

    def __str__(self):
        return f'{self.user.username} Profile'

    def save(self, *args, **kwargs):
        # You can add additional logic to handle automatic saving of user field
        super().save(*args, **kwargs)

class Board(models.Model):
    name = models.CharField(max_length=255) 
    def __str__(self):
        return self.name
    
class Task(models.Model):
    STATUS_CHOICES = [
        ('Incomplete', 'Incomplete'),
        ('Pending' , 'Pending'),
        ('Complete', 'Complete'),
    ]

    for_board = models.ForeignKey(Board , on_delete=models.CASCADE , blank=True, null=True )
    created_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='tasks_created'  # Unique related name for reverse access
    )
    title = models.CharField(max_length=255)  # Title of the task
    description = models.TextField(blank=True, null=True)  # Optional description field
    date = models.DateField()  # Date of the task
    created_at = models.DateTimeField(auto_now_add=True)  # Automatically set on creation
    is_important = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)  # Automatically set on update
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Incomplete')  # Task status

    def __str__(self):
        return self.title

class SubTask(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="subtasks")
    title = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True , null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    assigned_to = models.ManyToManyField(
        User,
        blank=True,
        related_name='subtasks_assigned'
    )
    STATUS_CHOICES = [
        ('Incomplete', 'Incomplete'),
        ('Complete', 'Complete'),
        ('Pending', 'Pending'),
    ]
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        null=True,  # Allows null
        blank=True,  # Allows blank
        default=None  # Default can be set to None or a specific status if needed
    )

    def __str__(self):
        return self.title
