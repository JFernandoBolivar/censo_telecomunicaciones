import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.contrib.auth import get_user_model
from apps.encuestas.models.models_encuestas import (
    Configuracion,
    PreguntaPersonalizada,
    UsuarioPermiso,
    RespuestaEncuesta,
    RespuestaOpciones,
    PreguntaOpciones
)
from apps.encuestas.services.excel_service import generar_excel_respuestas

Usuario = get_user_model()

def create_test_data():
    config = Configuracion.objects.first()
    if not config:
        print("No hay configuración activa.")
        return

    # Limpiar usuarios de prueba anteriores
    Usuario.objects.filter(email__in=['test_si@gmail.com', 'test_no@gmail.com']).delete()

    # Usuario 1: Responde SI y llena los datos
    user_si = Usuario.objects.create_user(
        email="test_si@gmail.com",
        password="123",
        nombre_empresa="Empresa SI",
        rif_empresa="J-11111111-1"
    )

    # Usuario 2: Responde NO y se salta las preguntas
    user_no = Usuario.objects.create_user(
        email="test_no@gmail.com",
        password="123",
        nombre_empresa="Empresa NO",
        rif_empresa="J-22222222-2"
    )

    preguntas = PreguntaPersonalizada.objects.filter(configuracion=config)

    def responder(user, codigo, valor):
        pregunta = preguntas.filter(validacion__codigo=codigo).first()
        if not pregunta:
            return
        
        permiso, _ = UsuarioPermiso.objects.get_or_create(
            usuario=user,
            pregunta_personalizada=pregunta
        )

        if valor in ["SI", "NO"]:
            opcion = PreguntaOpciones.objects.get(pregunta=pregunta, opcion=valor)
            RespuestaOpciones.objects.create(usuario_permiso=permiso, pregunta_opciones=opcion)
        else:
            RespuestaEncuesta.objects.create(usuario_permiso=permiso, respuesta=valor)

    # Empresa SI responde
    responder(user_si, "1.3", "Gerente")
    responder(user_si, "2.1", "SI")
    responder(user_si, "2.1.1", "50.5")
    responder(user_si, "2.1.2", "200")
    responder(user_si, "2.1.3", "10")
    responder(user_si, "2.1.4", "500")
    responder(user_si, "2.1.5", '{"estado": "Distrito Capital", "municipio": "Libertador"}')
    responder(user_si, "2.3", "SI")
    responder(user_si, "2.3.1", "Alianza estratégica comercial")

    # Empresa NO responde (se salta las dependientes de 2.1)
    responder(user_no, "1.3", "Directora")
    responder(user_no, "2.1", "NO")
    # NO RESPONDE 2.1.1, 2.1.2, 2.1.3, 2.1.4 ni 2.1.5
    responder(user_no, "2.2", "NO")
    responder(user_no, "2.3", "NO")
    # NO RESPONDE 2.3.1 ni 2.3.2

    print("Datos de prueba generados exitosamente.")

    # Generar Excel
    print("Generando archivo Excel...")
    excel_bytes = generar_excel_respuestas(config)
    
    excel_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "test_respuestas.xlsx")
    with open(excel_path, "wb") as f:
        f.write(excel_bytes.read())

    print(f"Archivo Excel guardado en: {excel_path}")

if __name__ == "__main__":
    create_test_data()
