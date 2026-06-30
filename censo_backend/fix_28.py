import os, sys, django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from apps.encuestas.models.models_encuestas import RespuestaEncuesta

try:
    r = RespuestaEncuesta.objects.get(id=28)
    r.respuesta = '[{"estado": "Distrito Capital", "municipio": "Libertador"}, {"estado": "Distrito Capital","municipio": "Libertador"}]'
    r.save()
    print('Corregido ID 28!')
except RespuestaEncuesta.DoesNotExist:
    pass

for r in RespuestaEncuesta.objects.filter(usuario_permiso__pregunta_personalizada__tipo_pregunta__nombre='seleccion geografica'):
    if '""estado"' in r.respuesta:
        fixed = r.respuesta.replace('""estado"', '"},{"estado"')
        fixed = f'[{fixed}]'
        r.respuesta = fixed
        r.save()
        print(f'Corregido ID {r.id}')
