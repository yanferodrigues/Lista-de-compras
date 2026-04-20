from django.urls import path
from .views import OnlineListView, OnlineDetailView

app_name = 'online'

urlpatterns = [
    path('',          OnlineListView.as_view(),   name='list'),
    path('<int:pk>/', OnlineDetailView.as_view(), name='detail'),
]
