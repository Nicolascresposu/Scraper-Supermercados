from django.shortcuts import render
from django.http import HttpResponse
from .models import Producto
from django.db.models import Q
from django.core.paginator import Paginator
import re
from unidecode import unidecode 
from django.http import JsonResponse
from django.shortcuts import render
from .services.analisis import AnalisisPrecios


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
    
    terms = [t for t in re.split(r'\s+', unidecode(q).lower()) if t]

    qs = Producto.objects.all()
    
    for t in terms:
        qs = qs.filter(
            Q(nombre__icontains=t)
        )

    qs = qs.order_by('precio') 

    paginator = Paginator(qs, 36)
    page = request.GET.get('page')
    productos = paginator.get_page(page)

    return render(request, 'buscar.html', {'q': q, 'productos': productos})

def precios_api(request):
    data = AnalisisPrecios.promedio_por_super()
    return JsonResponse({
        "labels": list(data.keys()),
        "values": list(data.values())
    })
    
def cantidad_productos_por_supermercado(request):
    data = AnalisisPrecios.cantidad_productos_por_supermercado()
    return JsonResponse({
        "labels": list(data.keys()),
        "values": list(data.values())
    })
    
def distribucion_precios(request):
    data = AnalisisPrecios.distribucion_precios_por_super()
    return JsonResponse(data, safe=False)    

def producto_precios(request):
    q = (request.GET.get('q') or '').strip()
    if not q:
        return JsonResponse({"labels": [], "values": [], "cheapest": None})
    try:
        data = AnalisisPrecios.producto_mas_barato(q)
        return JsonResponse(data)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({"error": str(e)}, status=500)


    