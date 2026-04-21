from django.urls import path
from .views import OnlineListView, OnlineDetailView, OnlineScrapeView

app_name = 'online'

urlpatterns = [
    path('',          OnlineListView.as_view(),   name='list'),
    path('scrape/',   OnlineScrapeView.as_view(),  name='scrape'),
    path('<int:pk>/', OnlineDetailView.as_view(), name='detail'),
]
