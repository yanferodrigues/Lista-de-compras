from django.db import models


class UserProfile(models.Model):
    name       = models.CharField(max_length=100, default='Usuário')
    email      = models.EmailField(blank=True, default='')
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Perfil do Usuário'
        verbose_name_plural = 'Perfis de Usuários'

    def __str__(self):
        return self.name

    @classmethod
    def get_instance(cls):
        """Retorna o perfil único da aplicação (singleton)."""
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def to_dict(self):
        return {
            'id':    self.id,
            'name':  self.name,
            'email': self.email,
        }
