import re
import json
import requests
from urllib.parse import urlparse
from bs4 import BeautifulSoup
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
            imagem=data.get('imagem', ''),
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


@method_decorator(csrf_exempt, name='dispatch')
class OnlineScrapeView(View):
    """POST /api/online/scrape/  →  { nome, preco, loja }
       Nunca retorna erro — sempre devolve dados parciais."""

    HEADERS = {
        'User-Agent': (
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
            'AppleWebKit/537.36 (KHTML, like Gecko) '
            'Chrome/124.0.0.0 Safari/537.36'
        ),
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    }

    def post(self, request):
        try:
            url = json.loads(request.body).get('url', '').strip()
        except Exception:
            return JsonResponse({'nome': '', 'preco': None, 'loja': ''})

        if not url:
            return JsonResponse({'nome': '', 'preco': None, 'loja': ''})

        result = {'nome': '', 'preco': None, 'loja': '', 'imagem': ''}

        try:
            resp = requests.get(url, headers=self.HEADERS, timeout=5, allow_redirects=True)
            soup = BeautifulSoup(resp.text, 'html.parser')

            # Estratégia 1: JSON-LD (mais confiável para e-commerce)
            for tag in soup.find_all('script', type='application/ld+json'):
                try:
                    data = json.loads(tag.string or '')
                    entries = data if isinstance(data, list) else [data]
                    for entry in entries:
                        if entry.get('@type') == 'Product':
                            if not result['nome']:
                                result['nome'] = entry.get('name', '')
                            offers = entry.get('offers', {})
                            if isinstance(offers, list):
                                offers = offers[0] if offers else {}
                            if not result['preco']:
                                result['preco'] = self._parse_price(
                                    offers.get('price') or entry.get('price')
                                )
                            break
                except Exception:
                    continue

            # Estratégia 2: Open Graph
            def og(prop):
                tag = soup.find('meta', property=f'og:{prop}')
                return tag.get('content', '').strip() if tag else ''

            if not result['nome']:
                result['nome'] = og('title')
            if not result['preco']:
                result['preco'] = self._parse_price(
                    og('price:amount') or og('product:price:amount')
                )
            if not result['loja']:
                result['loja'] = og('site_name')
            if not result['imagem']:
                result['imagem'] = og('image')

            # Estratégia 3: Fallback
            if not result['nome']:
                title_tag = soup.find('title')
                result['nome'] = title_tag.get_text().strip() if title_tag else ''
            if not result['loja']:
                result['loja'] = self._domain(url)

        except Exception:
            if not result['loja']:
                result['loja'] = self._domain(url)

        return JsonResponse(result)

    @staticmethod
    def _parse_price(raw):
        if raw is None:
            return None
        if isinstance(raw, (int, float)):
            return float(raw) if raw > 0 else None
        s = re.sub(r'[R$\s€£¥]', '', str(raw).strip())
        if not s:
            return None
        # Formato BR: 1.299,99
        if re.search(r'\d\.\d{3},\d{2}$', s):
            s = s.replace('.', '').replace(',', '.')
        # Formato EN com milhar: 1,299.99
        elif re.search(r'\d,\d{3}\.\d{2}$', s):
            s = s.replace(',', '')
        # Vírgula como decimal: 29,90
        elif ',' in s and '.' not in s:
            s = s.replace(',', '.')
        else:
            s = s.replace(',', '')
        try:
            val = float(s)
            return val if val > 0 else None
        except ValueError:
            return None

    @staticmethod
    def _domain(url):
        try:
            return (urlparse(url).hostname or '').replace('www.', '')
        except Exception:
            return ''
