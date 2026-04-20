from django.urls import path
from .views import UserProfileView

app_name = 'usuario'

urlpatterns = [
    path('', UserProfileView.as_view(), name='profile'),
]
