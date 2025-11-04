from django.urls import path
from . import views
from .views import ProductoSearchView

urlpatterns = [
    path("", views.home, name="home"),
    path('amarket/', views.amarket_view, name='amarket'),
    path('fidalga/', views.fidalga_view, name='fidalga'),
    path('hipermaxi/', views.hipermaxi_view, name='hipermaxi'),
    path('buscar/', views.buscar_view, name='buscar'),
    
    #api
    path('api/productos/', ProductoSearchView.as_view(), name='api-productos-search'), # búsqueda avanzada de productos
    path("api/promedios_precios/", views.precios_api, name="precios_api"), # promedios de precios por supermercado
    path("api/cantidad_productos/", views.cantidad_productos_por_supermercado, name="cantidad_productos_por_supermercado"), # cantidad de productos por supermercado
    path("api/distribucion_precios/", views.distribucion_precios, name="distribucion_precios"), # distribución de precios por supermercado
    path("api/producto/precios/", views.producto_precios, name="producto_precios"), # busqueda de precios de un producto específico
    # estas últimas 4 son para los gráficos
]