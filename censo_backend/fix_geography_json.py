import os
import sys
import django
import json

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.encuestas.models.models_encuestas import RespuestaEncuesta

def fix_broken_json():
    print("Buscando respuestas geográficas con JSON malformado...")
    # Filtramos las respuestas que pertenecen a preguntas de selección geográfica
    respuestas = RespuestaEncuesta.objects.filter(
        usuario_permiso__pregunta_personalizada__tipo_pregunta__nombre="seleccion geografica"
    )
    
    reparadas = 0
    for r in respuestas:
        raw_text = r.respuesta.strip()
        
        # Si tiene un choque de llaves "}{", significa que pegaron múltiples objetos JSON
        if "}{" in raw_text:
            print(f"\nDetectado JSON malformado en Respuesta ID {r.id}:")
            print(f"ORIGINAL: {raw_text}")
            
            # Reparamos
            fixed_text = raw_text.replace("}{", "},{")
            fixed_text = f"[{fixed_text}]"
            
            # Validamos que ahora sí sea JSON válido antes de guardarlo
            try:
                json.loads(fixed_text)
                r.respuesta = fixed_text
                r.save()
                print(f"CORREGIDO: {fixed_text}")
                reparadas += 1
            except Exception as e:
                print(f"Error al intentar reparar el JSON: {e}")

    print(f"\nFinalizado. Se han reparado {reparadas} respuestas en la base de datos.")

if __name__ == "__main__":
    fix_broken_json()
