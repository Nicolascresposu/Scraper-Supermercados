from django.shortcuts import render
from django.http import HttpResponse
from .models import Producto
from django.db.models import Q

# Create your views here.
def home(request):
    return render(request, "home.html")

def amarket_view(request):
    productos = Producto.objects.filter(supermercado='Amarket')[:50] # trae los primeros 50 productos de Amarket
    return render(request, 'amarket.html', {'productos': productos}) # aquí es donde pasas los productos al template

def fidalga_view(request):
    productos = Producto.objects.filter(supermercado='Fidalga')[:50] # trae los primeros 50 productos de Amarket
    return render(request, 'fidalga.html', {'productos': productos}) # aquí es donde pasas los productos al template

def hipermaxi_view(request):
    productos = Producto.objects.filter(supermercado='Hipermaxi')[:50] # trae los primeros 50 productos de Amarket
    return render(request, 'hipermaxi.html', {'productos': productos}) # aquí es donde pasas los productos al template

def buscar_view(request):
    