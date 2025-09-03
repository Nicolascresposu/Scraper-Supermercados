from django.db import models

class Producto(models.Model):
    product_id = models.CharField(max_length=50, primary_key=True)
    nombre = models.CharField(max_length=255)
    precio = models.FloatField()
    supermercado = models.CharField(max_length=50)

    def __str__(self):
        return self.nombre