from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('core.urls', namespace='core')),
    path('api/mercado/', include('mercado.urls', namespace='mercado')),
    path('api/online/', include('online.urls', namespace='online')),
    path('api/usuario/', include('usuario.urls', namespace='usuario')),
]
