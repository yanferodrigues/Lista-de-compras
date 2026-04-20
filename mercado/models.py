from django.db import models


class MercadoItem(models.Model):
    UNIDADES = [
        ('un', 'Unidade'),
        ('kg', 'Quilograma'),
        ('g', 'Grama'),
        ('L', 'Litro'),
        ('ml', 'Mililitro'),
        ('pct', 'Pacote'),
        ('cx', 'Caixa'),
    ]

    GRUPOS = [
        ('Geral', 'Geral'),
        ('Frutas & Verduras', 'Frutas & Verduras'),
        ('Laticínios', 'Laticínios'),
        ('Carnes', 'Carnes'),
        ('Padaria', 'Padaria'),
        ('Bebidas', 'Bebidas'),
        ('Limpeza', 'Limpeza'),
        ('Higiene', 'Higiene'),
        ('Congelados', 'Congelados'),
        ('Mercearia', 'Mercearia'),
    ]

    nome       = models.CharField(max_length=200)
    qty        = models.CharField(max_length=20, default='1')
    unit       = models.CharField(max_length=10, choices=UNIDADES, default='un')
    group      = models.CharField(max_length=50, choices=GRUPOS, default='Geral')
    checked    = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['group', 'created_at']
        verbose_name = 'Item do Mercado'
        verbose_name_plural = 'Itens do Mercado'

    def __str__(self):
        return f'{self.nome} ({self.qty} {self.unit})'

    def to_dict(self):
        return {
            'id':         self.id,
            'nome':       self.nome,
            'qty':        self.qty,
            'unit':       self.unit,
            'group':      self.group,
            'checked':    self.checked,
            'created_at': self.created_at.isoformat(),
        }
