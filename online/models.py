from django.db import models


class ItemOnline(models.Model):
    PRIORIDADE = [
        ('alta',  'Alta'),
        ('media', 'Média'),
        ('baixa', 'Baixa'),
    ]

    nome       = models.CharField(max_length=200)
    link       = models.URLField(blank=True, default='')
    loja       = models.CharField(max_length=100, blank=True, default='')
    preco      = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    prioridade = models.CharField(max_length=10, choices=PRIORIDADE, default='media')
    checked    = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
        verbose_name = 'Compra Online'
        verbose_name_plural = 'Compras Online'

    def __str__(self):
        return self.nome

    def to_dict(self):
        return {
            'id':         self.id,
            'nome':       self.nome,
            'link':       self.link,
            'loja':       self.loja,
            'preco':      float(self.preco) if self.preco is not None else 0,
            'prioridade': self.prioridade,
            'checked':    self.checked,
            'created_at': self.created_at.isoformat(),
        }
