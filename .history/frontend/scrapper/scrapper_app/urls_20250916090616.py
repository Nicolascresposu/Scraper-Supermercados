from django.urls import path
from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path('amarket/', views.amarket_view, name='amarket'),
    path('fidalga/', views.fidalga_view, name='fidalga'),
    path('hipermaxi/', views.hipermaxi_view, name='hipermaxi'),
    path('buscar/', views.buscar_view, name='buscar'),
    path("api/precios/", views.precios_api, name="precios_api"),
    path("api/cantidad/", views.cantidad_productos_api, name="cantidad_productos_api"),
    path("api/distribucion/", views.distribucion_precios_api, name="distribucion_precios_api"),
]