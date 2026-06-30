from collections import OrderedDict

def agrupar_preguntas_por_seccion(preguntas):
    """
    Agrupa una lista de preguntas por el nombre de su sección.
    Retorna un diccionario ordenado (OrderedDict).
    """
    agrupadas = OrderedDict()
    for p in preguntas:
        nombre_seccion = p.seccion.seccion if p.seccion else "Sin sección"
        agrupadas.setdefault(nombre_seccion, [])
        agrupadas[nombre_seccion].append(p)
    return agrupadas
