import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from apps.encuestas.models.models_encuestas import Configuracion
from apps.encuestas.services.excel_service import generar_excel_respuestas
config = Configuracion.objects.first()
excel_bytes = generar_excel_respuestas(config)
with open('test_respuestas.xlsx', 'wb') as f:
    f.write(excel_bytes.read())
print('Excel exportado')
