from django.contrib import admin
from .models import Producto

class Prodcto(models.Model):
    list_display = ('product_id', 'nombre', 'precio', 'supermercado')
    search_fields = ('nombre', 'supermercado')
    list_filter = ('supermercado',)
