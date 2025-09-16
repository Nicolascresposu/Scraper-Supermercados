from django.db import models

class Producto(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    name = models.TextField(max_length=255)
    price = models.FloatField()
    supermarket = models.CharField(max_length=50)
    imageLink = models.TextField(null=True) 
    # los campos de aquí deben coincidir con los de la base de datos
    
    class Meta:
        db_table = 'extraccion'

    def __str__(self):
        return self.name