import os
import sys
import django
import openpyxl

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from AUTOGESTION.models.models_encuestas import (
    TipoPregunta,
    PreguntasEncuestas,
    OpcionesPregunta,
)


def seed_database():
    print("Iniciando la siembra de preguntas desde el archivo Excel...")

    # 1. Crear tipos de preguntas si no existen
    tipos = [
        "texto",
        "texto largo",
        "entero",
        "decimal",
        "seleccion",
        "seleccion multiple",
    ]
    tipos_instances = {}
    for t in tipos:
        inst, created = TipoPregunta.objects.get_or_create(nombre=t)
        tipos_instances[t] = inst
        if created:
            print(f"Tipo de pregunta creado: {t}")

    # 2. Cargar el libro de Excel
    wb_path = "/home/jbolivar/Documentos/sistemas/encuestas/Encuesta Infraestructura-VGT_29062026.xlsx"
    if not os.path.exists(wb_path):
        print(f"Error: No se encontró el archivo Excel en {wb_path}")
        return

    wb = openpyxl.load_workbook(wb_path)
    sheet = wb.active

    # 3. Mapear las filas del Excel a sus tipos correspondientes
    # Tupla: (número_de_fila, tipo_pregunta, validacion_opcional)
    mapeo_filas = [
        (8, "texto", "Campo de texto"),
        (9, "texto", "Campo de texto"),
        (10, "texto", "Campo de texto"),
        (11, "texto", "Campo de texto / Email"),
        
        (16, "seleccion", "SI / NO"),
        (17, "decimal", "Variable numérica con 2 decimales"),
        (18, "entero", "Variable numérica, valores enteros"),
        (19, "decimal", "Variable numérica con 2 decimales"),
        (20, "entero", "Variable numérica, valores enteros"),
        (21, "seleccion multiple", "Entidades, municipios y parroquias"),
        
        (26, "seleccion", "SI / NO"),
        (27, "decimal", "Variable numérica con 2 decimales"),
        (28, "entero", "Variable numérica, valores enteros"),
        (29, "seleccion multiple", "Entidades, municipios y parroquias"),
        
        (34, "seleccion", "SI / NO"),
        (35, "texto largo", "Espacio para detalle de tipo de alianzas"),
        (37, "texto largo", "Espacio para detalle de zonas"),
        
        (40, "seleccion", "SI / NO"),
        (41, "texto largo", "Espacio para detalle de tipo de alianzas"),
        (43, "texto largo", "Espacio para detalle de zonas"),
        
        (49, "seleccion", "SI / NO"),
        (51, "seleccion", "SI / NO"),
        (52, "seleccion", "SI / NO"),
        (53, "seleccion", "SI / NO"),
        (54, "texto largo", "Detalle del tipo de infraestructura"),
        
        (55, "seleccion", "SI / NO"),
        (56, "seleccion", "SI / NO"),
        (57, "seleccion", "SI / NO"),
        (58, "texto largo", "Detalle del tipo de alianzas VGT"),
        
        (61, "texto largo", "Detalle de zonas saturadas"),
        (63, "texto largo", "Detalle de aportes o sugerencias"),
    ]

    orden = 1
    for r_idx, tipo_nombre, validacion in mapeo_filas:
        # Columna B es el código de pregunta (ej. '1.1', '2.1')
        # Columna C es el enunciado de la pregunta
        codigo = sheet.cell(row=r_idx, column=2).value
        enunciado = sheet.cell(row=r_idx, column=3).value

        if not enunciado:
            continue

        # Formatear el enunciado para que incluya el código (ej: "1.1 Nombre de la empresa:")
        full_enunciado = f"{codigo} {enunciado.strip()}" if codigo else enunciado.strip()
        # Truncar si excede el max_length de 200 en la base de datos
        if len(full_enunciado) > 200:
            full_enunciado = full_enunciado[:197] + "..."

        tipo_inst = tipos_instances[tipo_nombre]

        pregunta, created = PreguntasEncuestas.objects.update_or_create(
            enunciado=full_enunciado,
            defaults={
                "tipo": tipo_inst,
                "validacion": validacion,
                "orden": orden,
                "activo": True,
            }
        )

        status_str = "creada" if created else "actualizada"
        print(f"Pregunta {orden:02d} [{status_str}]: {full_enunciado[:50]}... ({tipo_nombre})")

        # Si el tipo es de selección (SI/NO), sembramos las opciones
        if tipo_nombre == "seleccion":
            for o_orden, op_text in enumerate(["SI", "NO"], start=1):
                OpcionesPregunta.objects.update_or_create(
                    pregunta=pregunta,
                    tipo_opcion=op_text,
                    defaults={
                        "orden": o_orden,
                    }
                )

        orden += 1

    print("\nSiembra de base de datos finalizada con éxito.")


if __name__ == "__main__":
    seed_database()
