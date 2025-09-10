from django.shortcuts import render
from django.http import HttpResponse
from .models import Producto
from django.db.models import Q
from django.core.paginator import Paginator


# Create your views here.
def home(request):
    return render(request, "home.html")

def amarket_view(request):
    productos = Producto.objects.filter(supermercado='Amarket') #[:50] # trae los primeros 50 productos de Amarket
    return render(request, 'amarket.html', {'productos': productos}) # aquí es donde pasas los productos al template

def fidalga_view(request):
    productos = Producto.objects.filter(supermercado='Fidalga') #[:50] # trae los primeros 50 productos de Amarket
    return render(request, 'fidalga.html', {'productos': productos}) # aquí es donde pasas los productos al template

def hipermaxi_view(request):
    productos = Producto.objects.filter(supermercado='Hipermaxi') #[:50] # trae los primeros 50 productos de Amarket
    return render(request, 'hipermaxi.html', {'productos': productos}) # aquí es donde pasas los productos al template

def buscar_view(request):
    q = (request.GET.get('q') or '').strip()

    if not q:
        return render(request, 'buscar.html', {'q': q, 'productos': []})

    qs = (Producto.objects
          .filter(Q(nombre__icontains=q))
          .order_by('precio'))  

    paginator = Paginator(qs, 36)
    page = request.GET.get('page')
    productos = paginator.get_page(page)

    return render(request, 'buscar.html', {'q': q, 'productos': productos})