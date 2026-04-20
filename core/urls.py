from django.urls import path
from . import views

app_name = 'core'

urlpatterns = [
    path('',          views.dashboard,    name='dashboard'),
    path('mercado/',  views.mercado_page, name='mercado'),
    path('online/',   views.online_page,  name='online'),
    path('usuario/',  views.usuario_page, name='usuario'),
    path('login/',    views.login_view,   name='login'),
    path('logout/',   views.logout_view,  name='logout'),
]
