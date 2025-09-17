from django.db.models import Avg, Min, Max
from models import Producto

class AnalisisPrecios:
    @staticmethod
    def promedio_por_super():
        query = (
            Producto.objects
            .values("supermercado")
            .annotate(precio_promedio=Avg("precio"))
        )
        return {row["supermercado"]: float(row["precio_promedio"]) for row in query}

    @staticmethod
    def producto_mas_barato(nombre_producto):
        query = (
            Producto.objects
            .filter(nombre=nombre_producto)
            .order_by("precio")
            .first()
        )
        return {
            "supermercado": query.supermercado,
            "precio": float(query.precio)
        } if query else None
        
    @staticmethod
    def cantidad_productos_por_supermercado():
        query = (
            Producto.objects
            .values("supermercado")
            .annotate(cantidad=models.Count("product_id"))
        )
        return {row["supermercado"]: row["cantidad"] for row in query}
    
    
            
