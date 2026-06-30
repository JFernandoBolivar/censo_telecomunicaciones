import os
import sys
import django
import openpyxl
from datetime import date

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.contrib.auth import get_user_model
from apps.encuestas.models.models_encuestas import (
    TipoPregunta,
    Configuracion,
    Seccion,
    PreguntaPersonalizada,
    PreguntaOpciones,
    Seleccionable,
    RespuestaEncuesta,
    RespuestaOpciones,
    UsuarioPermiso,
)

Usuario = get_user_model()

def clean_database():
    print("Limpiando la base de datos...")
    
    # En caso de PROTECT, el orden de borrado importa (de hijos a padres):
    print("Eliminando Respuestas...")
    RespuestaEncuesta.objects.all().delete()
    RespuestaOpciones.objects.all().delete()
    
    print("Eliminando Permisos, Seleccionables y Opciones...")
    UsuarioPermiso.objects.all().delete()
    Seleccionable.objects.all().delete()
    PreguntaOpciones.objects.all().delete()
    
    print("Eliminando Preguntas, Secciones y Configuracion...")
    PreguntaPersonalizada.objects.all().delete()
    Configuracion.objects.all().delete()
    Seccion.objects.all().delete()
    TipoPregunta.objects.all().delete()

    # 2. Mantener solo jose@gmail.com
    print("Eliminando usuarios, manteniendo solo a jose@gmail.com...")
    Usuario.objects.exclude(email="jose@gmail.com").delete()

    admin, created = Usuario.objects.get_or_create(email="jose@gmail.com")
    if created:
        admin.set_password("admin1234")
    
    admin.is_staff = True
    admin.is_active = True
    admin.nombre_empresa = "Admin Censo"
    admin.save()
    print("Base de datos limpia y administrador preparado.")

def seed_database():
    clean_database()
    
    print("\nIniciando la siembra de preguntas desde el archivo Excel...")

    # 1. Crear tipos de preguntas
    tipos = [
        ("texto", True),
        ("texto largo", True),
        ("entero", False),
        ("decimal", False),
        ("seleccion", False),
        ("seleccion multiple", False),
        ("seleccion geografica", False)
    ]
    tipos_instances = {}
    for nombre, es_texto in tipos:
        inst, created = TipoPregunta.objects.get_or_create(nombre=nombre, defaults={"es_texto": es_texto})
        if not created:
            inst.es_texto = es_texto
            inst.save()
        tipos_instances[nombre] = inst
        print(f"Tipo de pregunta listo: {nombre}")

    # 2. Crear Configuración y Secciones base
    admin = Usuario.objects.get(email="jose@gmail.com")
    config, _ = Configuracion.objects.get_or_create(
        fecha_inicio=date.today(),
        obligatorio=True,
        user_creator=admin
    )
    
    seccion1, _ = Seccion.objects.get_or_create(seccion="INFORMACIÓN INSTITUCIONAL")
    seccion2, _ = Seccion.objects.get_or_create(seccion="DESPLIEGUE Y COMPARTICIÓN DE INFRAESTRUCTURA")
    seccion3, _ = Seccion.objects.get_or_create(seccion="VIAS GENERALES DE TELECOMUNICACIONES (VGT)")

    # 3. Cargar el libro de Excel
    wb_path = r"c:\Users\josef\Downloads\encuestas\encuestas\Encuesta Infraestructura-VGT_29062026.xlsx"
    if not os.path.exists(wb_path):
        print(f"Error: No se encontró el archivo Excel en {wb_path}")
        return

    wb = openpyxl.load_workbook(wb_path)
    sheet = wb.active

    # Base JSON estático
    def build_json(codigo, regex=None, min_chars=0, max_chars=255, widget=None, depends_on=None):
        return {
            "codigo": codigo,
            "regex": regex,
            "min_chars": min_chars,
            "max_chars": max_chars,
            "widget": widget,
            "depends_on": depends_on
        }

    # Tupla: (fila_excel, codigo, seccion, tipo, JSON_kwargs, requiere_opciones_si_no)
    mapeo_filas = [
        # SECCION 1
        (8, "1.2", seccion1, "texto", {"regex": r"^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$", "min_chars": 3, "max_chars": 100}, False),
        (9, "1.3", seccion1, "texto", {"regex": r"^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$", "min_chars": 3, "max_chars": 100}, False),
        
        # SECCION 2
        (16, "2.1", seccion2, "seleccion", {"regex": r"^(SI|NO)$", "max_chars": 2}, True),
        (17, "2.1.1", seccion2, "decimal", {"regex": r"^\d+(\.\d{1,2})?$", "max_chars": 10}, False),
        (18, "2.1.2", seccion2, "entero", {"regex": r"^\d+$", "max_chars": 7}, False),
        (19, "2.1.3", seccion2, "decimal", {"regex": r"^\d+(\.\d{1,2})?$", "max_chars": 10}, False),
        (20, "2.1.4", seccion2, "entero", {"regex": r"^\d+$", "max_chars": 10}, False),
        (21, "2.1.5", seccion2, "seleccion geografica", {"max_chars": 1000, "widget": "geography_cascade"}, False),
        
        (26, "2.2", seccion2, "seleccion", {"regex": r"^(SI|NO)$", "max_chars": 2}, True),
        (27, "2.2.1", seccion2, "decimal", {"regex": r"^\d+(\.\d{1,2})?$", "max_chars": 10}, False),
        (28, "2.2.2", seccion2, "entero", {"regex": r"^\d+$", "max_chars": 10}, False),
        (29, "2.2.3", seccion2, "seleccion geografica", {"max_chars": 1000, "widget": "geography_cascade"}, False),
        
        (34, "2.3", seccion2, "seleccion", {"regex": r"^(SI|NO)$", "max_chars": 2}, True),
        (35, "2.3.1", seccion2, "texto largo", {"regex": r"^[\w\s\.,\-ñÑáéíóúÁÉÍÓÚ]+$", "max_chars": 2000, "depends_on": {"parent_question_code": "2.3", "expected_value": "SI", "action_if_false": "hide"}}, False),
        (37, "2.3.2", seccion2, "texto largo", {"regex": r"^[\w\s\.,\-ñÑáéíóúÁÉÍÓÚ]+$", "max_chars": 2000, "depends_on": {"parent_question_code": "2.3", "expected_value": "SI", "action_if_false": "hide"}}, False),
        
        (40, "2.4", seccion2, "seleccion", {"regex": r"^(SI|NO)$", "max_chars": 2}, True),
        (41, "2.4.1", seccion2, "texto largo", {"regex": r"^[\w\s\.,\-ñÑáéíóúÁÉÍÓÚ]+$", "max_chars": 2000, "depends_on": {"parent_question_code": "2.4", "expected_value": "SI", "action_if_false": "hide"}}, False),
        (43, "2.4.2", seccion2, "texto largo", {"regex": r"^[\w\s\.,\-ñÑáéíóúÁÉÍÓÚ]+$", "max_chars": 2000, "depends_on": {"parent_question_code": "2.4", "expected_value": "SI", "action_if_false": "hide"}}, False),
        
        # SECCION 3
        (49, "3.1", seccion3, "seleccion", {"regex": r"^(SI|NO)$", "max_chars": 2}, True),
        (54, "3.1.1", seccion3, "seleccion multiple", {"regex": r"^[\w\s\.,\-ñÑáéíóúÁÉÍÓÚ]+$", "max_chars": 2000, "depends_on": {"parent_question_code": "3.1", "expected_value": "SI", "action_if_false": "hide"}}, False),
        
        (51, "3.2", seccion3, "seleccion", {"regex": r"^(SI|NO)$", "max_chars": 2}, True),
        (52, "3.3", seccion3, "seleccion", {"regex": r"^(SI|NO)$", "max_chars": 2}, True),
        (53, "3.4", seccion3, "seleccion", {"regex": r"^(SI|NO)$", "max_chars": 2}, True),
        
        (55, "3.5", seccion3, "texto largo", {"regex": r"^[\w\s\.,\-ñÑáéíóúÁÉÍÓÚ]+$", "max_chars": 2000}, False),
        (61, "3.4(b)", seccion3, "texto largo", {"regex": r"^[\w\s\.,\-ñÑáéíóúÁÉÍÓÚ]+$", "max_chars": 2000}, False),
        (63, "3.5(b)", seccion3, "texto largo", {"regex": r"^[\w\s\.,\-ñÑáéíóúÁÉÍÓÚ]+$", "max_chars": 2000}, False),
    ]

    for r_idx, codigo, seccion_obj, tipo_nombre, json_kwargs, req_opciones in mapeo_filas:
        enunciado = sheet.cell(row=r_idx, column=3).value
        if not enunciado:
            continue

        full_enunciado = f"{codigo} {enunciado.strip()}"
        if len(full_enunciado) > 500:
            full_enunciado = full_enunciado[:497] + "..."

        tipo_inst = tipos_instances[tipo_nombre]
        
        # Construir JSON estático
        json_val = build_json(codigo, **json_kwargs)

        pregunta, created = PreguntaPersonalizada.objects.update_or_create(
            titulo=full_enunciado,
            configuracion=config,
            seccion=seccion_obj,
            defaults={
                "tipo_pregunta": tipo_inst,
                "validacion": json_val,
                "es_obligatorio": True,
            }
        )

        status_str = "creada" if created else "actualizada"
        print(f"Pregunta [{status_str}]: {codigo} ({tipo_nombre})")

        if req_opciones:
            for op_text in ["SI", "NO"]:
                PreguntaOpciones.objects.get_or_create(
                    pregunta=pregunta,
                    opcion=op_text
                )

    print("\nSiembra de base de datos finalizada con éxito.")

if __name__ == "__main__":
    seed_database()
