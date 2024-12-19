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


def user_task_list(request, user_id, board_id):
    if request.method == "GET":
        # Filter tasks by user_id and board_id
        user_tasks = Task.objects.filter(created_by=user_id, for_board=board_id)

        task_data = [{
            'id': task.id,
            'title': task.title,
            'description': task.description,
            'date': task.date,
            'status': task.status,
            'is_important': task.is_important,
            'created_at': task.created_at,
            'updated_at': task.updated_at,
            # Include subtasks for each task
            'subtasks': [
                {
                    'id': subtask.id,
                    'title': subtask.title,
                    'created_at': subtask.created_at,
                    'updated_at': subtask.updated_at
                }
                for subtask in task.subtasks.all()
            ]
        } for task in user_tasks]

        return JsonResponse({
            'tasks': task_data
        }, status=200)  # Return status 200 for successful response

    return JsonResponse({'error': 'GET request required'}, status=400)


@csrf_exempt
def create_task_view(request, boardId):
    if request.method == "POST":
        # Parse the incoming JSON data
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

        # Check if the board exists
        try:
            board = Board.objects.get(id=boardId)
        except Board.DoesNotExist:
            return JsonResponse({'error': 'Board not found.'}, status=404)

        # Create the task and associate it with the board
        task = Task.objects.create(
            title=title,
            description=description,
            date=date,
            created_by=created_by_user,  # Assign the User instance here
            status=status,
            is_important=is_important,
            for_board=board  # Associate the task with the board
        )

        # Return the task data in the response
        return JsonResponse({
            'id': task.id,
            'title': task.title,
            'description': task.description,
            'date': task.date,
            'status': task.status,
            'is_important': task.is_important,
            'created_at': task.created_at,
            'updated_at': task.updated_at,
            'board_id': task.for_board.id  # Include board ID for reference
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
def edit_task(request, boardId, task_id):
    try:
        # Ensure the task exists and belongs to the provided boardId
        task = Task.objects.get(id=task_id, for_board_id=boardId)
    except Task.DoesNotExist:
        return JsonResponse({'error': 'Task not found or does not belong to the specified board'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PUT':
        try:
            # Parse the incoming JSON data
            data = JSONParser().parse(request)  # Parse the JSON body
            serializer = TaskSerializer(task, data=data)
            if serializer.is_valid():
                # Save the updated task
                serializer.save()
                return JsonResponse(serializer.data, status=status.HTTP_200_OK)
            return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    return JsonResponse({'error': 'Invalid HTTP method'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)



from django.shortcuts import get_object_or_404
from django.shortcuts import get_object_or_404
@csrf_exempt
def delete_task(request, boardId, task_id):
    try:
        # Ensure the task exists and belongs to the provided boardId
        task = Task.objects.get(id=task_id, for_board_id=boardId)
        task.delete()
        return JsonResponse({"message": "Task deleted successfully"}, status=201)
    except Task.DoesNotExist:
        return JsonResponse({"error": "Task not found or does not belong to the specified board"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


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
            return JsonResponse({'id': board.id, 'title': board.name}, status=201)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid method'}, status=405)

@csrf_exempt
def get_boards(request):
    if request.method == "GET":
        boards = Board.objects.all()
        board_data = [{
                'id' : board.id,
                'title': board.name,
               } for board in boards]
        return JsonResponse({
            'boards' : board_data 
        }, status = 201)
    return JsonResponse({'error': 'GET request required'}, status=400)

@csrf_exempt
def get_users(request):
    if request.method == "GET":
        # Exclude the requester (current logged-in user)
        users = User.objects.exclude(id=request.user.id)

        # Prepare the list of users in the desired format
        user_list = [{"id": user.id, "username": user.username} for user in users]

        # Return the users as a JSON response
        return JsonResponse({"users": user_list}, status=200)

    # If the request is not a GET request, return an error message
    return JsonResponse({"error": "GET request required"}, status=400)
 


from .models import Task, SubTask
from .serializers import SubTaskSerializer
from django.core.exceptions import ObjectDoesNotExist

@csrf_exempt
def create_subtask(request, task_id):
    if request.method == "POST":
        try:
            # Fetch the task by task_id
            task = Task.objects.get(id=task_id)
            print(f"Task found: {task}")

            # Parse JSON data from the request body
            data = JSONParser().parse(request)
            print(f"Received data: {data}")

            # Ensure that the task ID is correctly assigned to the subtask data
            data['task'] = task.id

            # Create the subtask using the SubtaskSerializer
            serializer = SubTaskSerializer(data=data)

            # Validate the serializer data
            if serializer.is_valid():
                # Save the subtask and return the serialized data
                subtask = serializer.save()
                print(f"SubTask created: {subtask}")
                return JsonResponse(serializer.data, status=201)
            else:
                print(f"Serializer errors: {serializer.errors}")
                return JsonResponse({'errors': serializer.errors}, status=400)

        except ObjectDoesNotExist:
            # Handle the case where the Task does not exist
            print("Task not found.")
            return JsonResponse({'error': 'Task not found'}, status=404)
        
        except Exception as e:
            # Handle unexpected errors
            print(f"Unexpected error: {e}")
            return JsonResponse({'error': str(e)}, status=500)


# List SubTasks
@csrf_exempt
def list_subtasks(request, task_id):
    if request.method == "GET":
        try:
            subtasks = SubTask.objects.filter(task_id=task_id)
            serializer = SubTaskSerializer(subtasks, many=True)
            return JsonResponse(serializer.data, safe=False, status=200)
        except Task.DoesNotExist:
            return JsonResponse({'error': 'Task not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

# Edit SubTask
@csrf_exempt
def edit_subtask(request, subtask_id):
    try:
        subtask = SubTask.objects.get(id=subtask_id)  # Ensure SubTask exists
    except SubTask.DoesNotExist:
        return JsonResponse({'error': 'SubTask not found'}, status=404)

    if request.method == "PUT":
        try:
            data = JSONParser().parse(request)
            serializer = SubTaskSerializer(subtask, data=data)
            if serializer.is_valid():
                serializer.save()
                return JsonResponse(serializer.data, status=200)
            return JsonResponse(serializer.errors, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

# Delete SubTask
@csrf_exempt
def delete_subtask(request, subtask_id):
    try:
        subtask = SubTask.objects.get(id=subtask_id)  # Ensure SubTask exists
        if request.method == "DELETE":
            subtask.delete()
            return JsonResponse({'message': 'SubTask deleted successfully'}, status=200)
        else:
            return JsonResponse({'error': 'Invalid request method'}, status=405)
    except SubTask.DoesNotExist:
        return JsonResponse({'error': 'SubTask not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
