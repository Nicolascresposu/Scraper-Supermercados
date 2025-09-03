from django.shortcuts import render
from django.http import HttpResponse
from .models import Producto

# Create your views here.
def home(request):
    return render(request, "home.html")

def amarket_view(request):
    productos = Producto.objects.filter(supermercado='Amarket')[:50] # trae los primeros 50 productos de Amarket
    return render(request, 'amarket.html', {'productos': productos})
