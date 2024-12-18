from django.contrib import admin
from .models import Task , Profile , Board

admin.site.register(Board)
admin.site.register(Profile)
admin.site.register(Task)