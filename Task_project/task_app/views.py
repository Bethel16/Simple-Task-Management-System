from django.shortcuts import render , redirect
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Profile, Task
from .serializers import ProfileSerializer, TaskSerializer
from django.contrib.auth import authenticate, login
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.contrib.auth.models import User
import json
from rest_framework_simplejwt.tokens import RefreshToken

# User Profile View (GET and PUT)
class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = Profile.objects.get(user=request.user)
        serializer = ProfileSerializer(profile)
        return Response(serializer.data)

    def put(self, request):
        profile = Profile.objects.get(user=request.user)
        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

# Register View (POST request for new user)
@csrf_exempt
def register_view(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST requests are allowed.'}, status=405)

    try:
        # Extract form data
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        email = data.get('email')

        # Validate required fields
        if not all([username, password, first_name, last_name, email]):
            return JsonResponse({'error': 'All fields are required.'}, status=400)

        # Check if username or email already exists
        if User.objects.filter(username=username).exists():
            return JsonResponse({'error': 'Username already taken.'}, status=400)
        if User.objects.filter(email=email).exists():
            return JsonResponse({'error': 'Email already registered.'}, status=400)

        # Create the user
        user = User.objects.create_user(
            username=username,
            password=password,
            first_name=first_name,
            last_name=last_name,
            email=email
        )

        return JsonResponse({
            'message': 'User registered successfully!',
            'id': user.id,
            'username': user.username,
            'email': user.email,
        }, status=201)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
@csrf_exempt
def login_view(request):
    if request.method == "POST":
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')

        # Authenticate the user
        user = authenticate(username=username, password=password)
        if user is not None:
            login(request, user)

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)

            # Get profile data if available
            profile_data = ProfileSerializer(user.profile).data if hasattr(user, 'profile') else {}

            # Fetch the tasks created by the user
            user_tasks = Task.objects.filter(created_by=user)
            task_data = [{
                'id' : task.id,
                'title': task.title,
                'description': task.description,
                'date': task.date,
                'status': task.status,
                'is_important': task.is_important ,
                'created_at' : task.created_at,
                'updated_at' : task.updated_at
            } for task in user_tasks]

            return JsonResponse({
                'message': 'Login successful',
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'profile': profile_data,
                'tasks': task_data,  # Send tasks data
                'access_token': access_token,
                'refresh_token': refresh_token
            })

        return JsonResponse({'error': 'Invalid credentials'}, status=401)

    return JsonResponse({'error': 'POST request required'}, status=400)

# List Users View (GET request to list all users excluding logged-in user)
@csrf_exempt
def user_task_list(request, user_id):
    if request.method == "GET":
        user_tasks = Task.objects.filter(created_by=user_id)
        task_data = [{
                        'id' : task.id,
                'title': task.title,
                'description': task.description,
                'date': task.date,
                'status': task.status,
                'is_important': task.is_important ,
                'created_at' : task.created_at,
                'updated_at' : task.updated_at
            } for task in user_tasks]
        return JsonResponse({
            'tasks' : task_data 
        }, status = 201)
    return JsonResponse({'error': 'GET request required'}, status=400)


@csrf_exempt
def create_task_view(request):
    if request.method == "POST":
        data = json.loads(request.body)
        title = data.get('title')
        description = data.get('description', '')
        date = data.get('date')
        created_by_id = data.get('created_by')
        is_important = data.get('is_important', False)  # Default to False if not provided
        status = data.get('status', 'Incomplete')  # Default to 'Incomplete'

        # Validate required fields
        if not title or not date:
            return JsonResponse({'error': 'Title and date are required.'}, status=400)

        # Check if the creator user exists
        try:
            created_by_user = User.objects.get(id=created_by_id)
        except User.DoesNotExist:
            return JsonResponse({'error': 'Creator user not found.'}, status=404)

        # Create the task
        task = Task.objects.create(
            title=title,
            description=description,
            date=date,
            created_by=created_by_user,  # Assign the User instance here
            status=status,
            is_important=is_important
        )

        # Serialize and return the task data
        task_serializer = TaskSerializer(task)
        print(task.id)
        return JsonResponse({
            'id' : task.id,
             'title': task.title,
                'description': task.description,
                'date': task.date,
                'status': task.status,
                'is_important': task.is_important ,
                'created_at' : task.created_at,
                'updated_at' : task.updated_at
        }, status=201)

    return JsonResponse({'error': 'POST request required'}, status=400)

from rest_framework import status
from rest_framework.request import Request # Import DRF's Request

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser
from rest_framework import status
from .models import Task
from .serializers import TaskSerializer

@csrf_exempt
def edit_task(request, task_id):
    try:
        task = Task.objects.get(id=task_id)
    except Task.DoesNotExist:
        return JsonResponse({'error': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PUT':
        try:
            data = JSONParser().parse(request)  # Parse the JSON body
            serializer = TaskSerializer(task, data=data)
            if serializer.is_valid():
                serializer.save()
                return JsonResponse(serializer.data, status=status.HTTP_200_OK)
            return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    return JsonResponse({'error': 'Invalid HTTP method'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)



from django.shortcuts import get_object_or_404
@csrf_exempt
def delete_task(request, task_id):
    try:
        task = Task.objects.get(id=task_id)
        task.delete()
        return JsonResponse({"message": "Task deleted successfully"}, status=201)
    except Task.DoesNotExist:
        return JsonResponse({"error": "Task not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)



from django.views.decorators.csrf import csrf_exempt
from .models import Board  # Assuming you have a Board model

@csrf_exempt  # If you're not using CSRF tokens, otherwise remove this.
def create_board(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            name = data.get('title')  # Board name from the request data

            if not name:
                return JsonResponse({'error': 'Board name is required'}, status=400)

            # Create and save the board
            board = Board.objects.create(name=name)
            return JsonResponse({'id': board.id, 'name': board.name}, status=201)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid method'}, status=405)
