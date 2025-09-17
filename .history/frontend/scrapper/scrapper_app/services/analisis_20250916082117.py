from django.db.models import Avg, Min, Max, Count
from scrapper_app.models import Producto


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
    
    @staticmethod
    def distribucion_precios_por_super():
        query = (
            Producto.objects
            .values("supermercado")
            .annotate(
                precio_min=Min("precio"),
                precio_max=Max("precio"),
                precio_promedio=Avg("precio"),
            )
            .order_by("supermercado")
        )
        return [
            {
                "supermercado": row["supermercado"],
                "min": float(row["precio_min"]),
                "max": float(row["precio_max"]),
                "promedio": float(row["precio_promedio"]),
            }
            for row in query
        ]   
    
    
            
