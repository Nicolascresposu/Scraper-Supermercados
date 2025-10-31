from django.shortcuts import render
from django.http import JsonResponse
from django.db import connection
import json

# Vista 1: Carga la plantilla HTML
def pagina_grafico(request):
    return render(request, 'grafico.html')

# Vista 2: API que consulta la base de datos y sirve los datos al JavaScript
def datos_del_grafico(request):
    # Consulta SQL para calcular el precio promedio por supermercado
    query = """
        SELECT 
            supermarket, 
            AVG(price) as average_price 
        FROM 
            extraccion 
        GROUP BY 
            supermarket
    """
    
    labels = []  # Nombres de supermercados
    data = []    # Precios promedio
    
    try:
        with connection.cursor() as cursor:
            cursor.execute(query)
            rows = cursor.fetchall()

        if rows:
            for row in rows:
                labels.append(row[0]) 
                data.append(round(row[1], 2)) 
        else:
            # Datos de ejemplo si la BD está vacía o hay error
            labels = ['Hipermaxi', 'Amarket', 'Fidalga']
            data = [10.5, 20.1, 15.7] 

    except Exception:
        # Datos de ejemplo en caso de error
        labels = ['Hipermaxi', 'Amarket', 'Fidalga']
        data = [10.5, 20.1, 15.7]

    return JsonResponse({
        'labels': labels,
        'data': data,
    })


