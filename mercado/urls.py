from django.urls import path
from .views import MercadoListView, MercadoDetailView

app_name = 'mercado'

urlpatterns = [
    path('',        MercadoListView.as_view(),   name='list'),
    path('<int:pk>/', MercadoDetailView.as_view(), name='detail'),
]
