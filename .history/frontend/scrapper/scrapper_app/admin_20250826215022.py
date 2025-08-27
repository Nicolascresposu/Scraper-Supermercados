from django.contrib import admin
from .models import Producto

admin.site.register(Producto) # se registra para que sea visible en el admin, aunque para este proyecto no se usará el admin
