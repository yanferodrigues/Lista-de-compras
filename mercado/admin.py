from django.contrib import admin
from .models import MercadoItem


@admin.register(MercadoItem)
class MercadoItemAdmin(admin.ModelAdmin):
    list_display  = ('nome', 'qty', 'unit', 'group', 'checked', 'created_at')
    list_filter   = ('group', 'checked')
    search_fields = ('nome',)
    list_editable = ('checked',)
