from django.db import models

class Producto(models.Model):
    product_id = models.CharField(max_length=50, primary_key=True)
    nombre = models.TextField(max_length=255)
    precio = models.FloatField()
    supermercado = models.CharField(max_length=50)
    # los campos de aquí deben coincidir con los de la base de datos
    
    class Meta:
        db_table = 'productos'

    def __str__(self):
        return self.nombre