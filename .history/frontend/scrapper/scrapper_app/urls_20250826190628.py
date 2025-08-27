from django.urls import path
from .views import views

urlpatterns = [
    path("home/", views.home, name="home")
]