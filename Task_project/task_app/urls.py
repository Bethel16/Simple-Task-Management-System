from django.urls import path
from .views import UserProfileView, register_view , login_view , create_task_view , user_task_list , edit_task , create_board , delete_task , get_boards, create_subtask , delete_subtask , edit_subtask,list_subtasks , get_users
from django.conf import settings
from django.conf.urls.static import static
urlpatterns = [
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('register/', register_view, name='register'),
    path('login/', login_view , name='login'),
    path('create-task/<int:boardId>/', create_task_view, name='create-task'),
    path('edit-task/<int:boardId>/<int:task_id>/', edit_task, name='edit-task'),
    path('create-board/', create_board, name='create_board'),
    path('delete-task/<int:boardId>/<int:task_id>/', delete_task, name='delete-task'),
    path('boards/' ,get_boards , name='board') , 
    path('board-tasks/<int:board_id>/user/<int:user_id>/', user_task_list, name='user_task_list'),
    path('create-subtask/<int:task_id>/', create_subtask, name='create-subtask'),
    path('subtasks/<int:task_id>/list/', list_subtasks, name='list_subtasks'),
    path('subtasks/edit/<int:subtask_id>/', edit_subtask, name='edit_subtask'),
    path('subtasks/delete/<int:subtask_id>/', delete_subtask, name='delete_subtask'),
    path('get-users/', get_users , name='get-users' ) , 


] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
