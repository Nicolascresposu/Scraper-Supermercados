from django.db import models

class Producto(models.Model):
    product_id = models.CharField(max_length=50, primary_key=True)
    nombre = models.TextField(max_length=255)
    precio = models.FloatField()
    supermercado = models.CharField(max_length=50)
    image_link = models.TextField(null=True) 
    
    class Meta:
        db_table = 'productos'

    def __str__(self):
        return self.nombre
    
    @property
    def color_css(self):
        colores = {
            "Fidalga": "text-fildaga",
            "Hipermaxi": "text-hipermaxi",
            "Amarket": "text-amarket",
        }
        key = (self.supermercado or "").strip().lower()
        return colores.get(self.supermercado, "text-secondary")