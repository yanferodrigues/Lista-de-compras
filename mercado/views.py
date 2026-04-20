import json
from django.http import JsonResponse
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from .models import MercadoItem


@method_decorator(csrf_exempt, name='dispatch')
class MercadoListView(View):
    """GET /api/mercado/  →  lista todos os itens
       POST /api/mercado/ →  cria novo item"""

    def get(self, request):
        items = [i.to_dict() for i in MercadoItem.objects.all()]
        return JsonResponse(items, safe=False)

    def post(self, request):
        data = json.loads(request.body)
        item = MercadoItem.objects.create(
            nome=data.get('nome', ''),
            qty=data.get('qty', '1'),
            unit=data.get('unit', 'un'),
            group=data.get('group', 'Geral'),
        )
        return JsonResponse(item.to_dict(), status=201)


@method_decorator(csrf_exempt, name='dispatch')
class MercadoDetailView(View):
    """PATCH /api/mercado/<pk>/ →  atualiza item (ex: toggle checked)
       DELETE /api/mercado/<pk>/ → remove item"""

    def patch(self, request, pk):
        try:
            item = MercadoItem.objects.get(pk=pk)
        except MercadoItem.DoesNotExist:
            return JsonResponse({'error': 'Item não encontrado'}, status=404)
        data = json.loads(request.body)
        for field in ('nome', 'qty', 'unit', 'group', 'checked'):
            if field in data:
                setattr(item, field, data[field])
        item.save()
        return JsonResponse(item.to_dict())

    def delete(self, request, pk):
        MercadoItem.objects.filter(pk=pk).delete()
        return JsonResponse({'ok': True})
