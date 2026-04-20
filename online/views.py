import json
from django.http import JsonResponse
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from .models import ItemOnline


@method_decorator(csrf_exempt, name='dispatch')
class OnlineListView(View):
    """GET /api/online/  →  lista todos os itens
       POST /api/online/ →  cria novo item"""

    def get(self, request):
        items = [i.to_dict() for i in ItemOnline.objects.all()]
        return JsonResponse(items, safe=False)

    def post(self, request):
        data = json.loads(request.body)
        item = ItemOnline.objects.create(
            nome=data.get('nome', ''),
            link=data.get('link', ''),
            loja=data.get('loja', ''),
            preco=data.get('preco') or None,
            prioridade=data.get('prioridade', 'media'),
        )
        return JsonResponse(item.to_dict(), status=201)


@method_decorator(csrf_exempt, name='dispatch')
class OnlineDetailView(View):
    """PATCH /api/online/<pk>/ →  atualiza item
       DELETE /api/online/<pk>/ → remove item"""

    def patch(self, request, pk):
        try:
            item = ItemOnline.objects.get(pk=pk)
        except ItemOnline.DoesNotExist:
            return JsonResponse({'error': 'Item não encontrado'}, status=404)
        data = json.loads(request.body)
        for field in ('nome', 'link', 'loja', 'prioridade', 'checked'):
            if field in data:
                setattr(item, field, data[field])
        if 'preco' in data:
            item.preco = data['preco'] or None
        item.save()
        return JsonResponse(item.to_dict())

    def delete(self, request, pk):
        ItemOnline.objects.filter(pk=pk).delete()
        return JsonResponse({'ok': True})
