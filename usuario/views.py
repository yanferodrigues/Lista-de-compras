import json
from django.http import JsonResponse
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from .models import UserProfile


@method_decorator(csrf_exempt, name='dispatch')
class UserProfileView(View):
    """GET /api/usuario/  →  retorna perfil
       POST /api/usuario/ →  atualiza perfil"""

    def get(self, request):
        return JsonResponse(UserProfile.get_instance().to_dict())

    def post(self, request):
        data = json.loads(request.body)
        profile = UserProfile.get_instance()
        if 'name' in data:
            profile.name = data['name']
        if 'email' in data:
            profile.email = data['email']
        profile.save()
        return JsonResponse(profile.to_dict())
