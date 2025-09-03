from django.urls import path
from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path('amarket/', views.amarket_view, name='amarket'),
]