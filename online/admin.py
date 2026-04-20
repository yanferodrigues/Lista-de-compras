from django.contrib import admin
from .models import ItemOnline


@admin.register(ItemOnline)
class ItemOnlineAdmin(admin.ModelAdmin):
    list_display  = ('nome', 'loja', 'preco', 'prioridade', 'checked', 'created_at')
    list_filter   = ('prioridade', 'checked')
    search_fields = ('nome', 'loja')
    list_editable = ('checked',)
