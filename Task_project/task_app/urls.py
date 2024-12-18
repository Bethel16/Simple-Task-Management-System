from django.urls import path
from .views import UserProfileView, register_view , login_view , create_task_view , user_task_list , edit_task , create_board , delete_task
from django.conf import settings
from django.conf.urls.static import static
urlpatterns = [
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('register/', register_view, name='register'),
    path('login/', login_view , name='login'),
    path('create-task/', create_task_view, name='create-task'),
    path('user-task/<int:user_id>/', user_task_list, name='user-task'),
    path('edit-task/<int:task_id>/', edit_task, name='edit-task' ),
    path('create-board/', create_board, name='create_board'),
    path('delete-task/<int:task_id>/',delete_task, name='delete_task'),


] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
