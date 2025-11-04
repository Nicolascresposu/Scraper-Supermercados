from django.shortcuts import render

class ProductoSearchView(generics.ListAPIView):
    queryset = Producto.objects.all().order_by('nombre', 'precio')
    serializer_class = ProductoSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['supermercado'] # Para ?supermercado=amarket
    search_fields = ['nombre', 'product_id'] # Para ?search=leche  
