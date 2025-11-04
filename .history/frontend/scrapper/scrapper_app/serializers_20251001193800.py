from rest_framework import serializers
from .models import Producto

class PrecioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Producto
        fields = ['producto', 'supermercado']

class ProductoSerializer(serializers.ModelSerializer):
    # Esto es crucial: anida los precios para ver la comparación directamente
    precios = PrecioSerializer(many=True, read_only=True) 

    class Meta:
        model = Producto
        # Asume que tienes campos como 'nombre', 'descripcion', 'codigo_barra'
        fields = ['id', 'nombre', 'descripcion', 'precios']