from rest_framework import serializers
from .models import Producto # Asegúrate de importar tu modelo Producto

class ProductoSerializer(serializers.ModelSerializer):    
    class Meta:
        model = Producto
        fields = ['product_id', 'nombre', 'precio', 'supermercado', 'image_link']
