from django.db.models import Avg, Min, Max, Count, Q
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
        qs = (
        Producto.objects
        .filter(nombre__icontains=nombre_producto)
        .values("supermercado")
        .annotate(precio=Min("precio"))   # puedes usar Avg o Max si prefieres
        .order_by("supermercado")
    )
        return {
            "labels": [r["supermercado"] for r in qs],
            "values": [float(r["precio"]) for r in qs]
        }
        
    @staticmethod
    def cantidad_productos_por_supermercado():
        query = (
            Producto.objects
            .values("supermercado")
            .annotate(cantidad=Count("product_id"))
        )
        return {row["supermercado"]: row["cantidad"] for row in query}
    
    @staticmethod
    def producto_precios_por_supermercado(nombre_producto: str):
        # Normaliza la consulta del usuario
        query_str = unidecode(nombre_producto).lower()
        terms = [t for t in re.split(r'\s+', query_str) if t]

        # Construye un Q con AND de icontains por cada token
        q = Q()
        for t in terms:
            q &= Q(nombre__icontains=t)

        qs = (
            Producto.objects
            .filter(q)
            .values('supermercado')
            .annotate(precio=Min('precio'))   # o Avg('precio')
            .order_by('supermercado')
        )

        labels = [row['supermercado'] for row in qs]
        values = [float(row['precio']) for row in qs]
        cheapest = None
        if values:
            i = min(range(len(values)), key=lambda k: values[k])
            cheapest = {"super": labels[i], "precio": values[i]}
        return {"labels": labels, "values": values, "cheapest": cheapest}
    
    
            
