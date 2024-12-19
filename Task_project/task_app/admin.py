from django.contrib import admin
from .models import Task , Profile , Board , SubTask

admin.site.register(Board)
admin.site.register(Profile)
admin.site.register(Task)
admin.site.register(SubTask)
