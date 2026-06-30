import os
import sys
import django

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.contrib.auth.models import User
from rest_framework.test import APIClient
from AUTOGESTION.models.models_encuestas import PreguntasEncuestas
from geography.models import Estado


def test_system():
    print("--- INICIANDO PRUEBAS DE ENDPOINTS BACKEND ---")
    client = APIClient()

    # 1. Crear usuario de prueba
    username = "empresa_test"
    email = "test@empresa.com"
    password = "password123"

    from AUTOGESTION.models.models_encuestas import RespuestasEncuesta
    test_users = User.objects.filter(email=email)
    RespuestasEncuesta.objects.filter(usuario__in=test_users).delete()
    test_users.delete()
    User.objects.filter(username=username).delete()


    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name="Empresa",
        last_name="Telecom S.A.",
    )
    print(f"Usuario de prueba creado: {email}")

    # 2. Probar Login API
    response = client.post(
        "/api/encuestas/auth/login/",
        {"email": email, "password": password},
        format="json",
    )
    assert response.status_code == 200, f"Login fallido: {response.data}"
    token = response.data["data"]["access"]
    print(f"¡Login exitoso! Access token (JWT) obtenido.")

    # Establecer la cabecera de autenticación Bearer JWT
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    # 3. Probar obtención de preguntas
    response = client.get("/api/encuestas/preguntas/")
    assert (
        response.status_code == 200
    ), f"Obtención de preguntas fallida: {response.data}"
    questions = response.data["data"]
    print(f"Se obtuvieron {len(questions)} preguntas activas de la encuesta.")

    # 4. Probar conexión geográfica a ENVIADA (PostgreSQL)
    try:
        response = client.get("/api/geography/states/")
        assert (
            response.status_code == 200
        ), f"Obtención de estados fallida: {response.data}"
        states = response.data["data"]
        print(
            f"¡Conexión exitosa a la base de datos geográfica! Se obtuvieron {len(states)} estados. Primeros 3:"
        )
        for s in states[:3]:
            print(f"  - ID: {s['id']} | Estado: {s['estado']}")
    except Exception as e:
        print(f"Error al consultar la base de datos geográfica: {e}")

    # 5. Registrar respuestas de prueba (Razón Social y respuesta Sí/No)
    closed_q = PreguntasEncuestas.objects.filter(tipo__nombre="seleccion").first()
    text_q = PreguntasEncuestas.objects.filter(tipo__nombre="texto").first()

    payload = {"respuestas": []}

    if closed_q:
        option = closed_q.opciones.first()
        payload["respuestas"].append(
            {"pregunta": closed_q.id, "opcion": option.id, "respuesta": ""}
        )
    if text_q:
        payload["respuestas"].append(
            {
                "pregunta": text_q.id,
                "opcion": None,
                "respuesta": "Telecomunicaciones de Venezuela S.A.",
            }
        )

    response = client.post("/api/encuestas/respuestas/", payload, format="json")
    assert (
        response.status_code == 201
    ), f"Registro de respuestas fallido: {response.data}"
    print("¡Respuestas registradas correctamente a través de la API!")

    # 6. Consultar respuestas registradas
    response = client.get("/api/encuestas/respuestas/consultar/")
    assert (
        response.status_code == 200
    ), f"Consulta de respuestas fallida: {response.data}"
    user_responses = response.data["data"]
    print(f"Se recuperaron {len(user_responses)} respuestas para el usuario:")
    for r in user_responses:
        ans_val = r["respuesta"] or r["opcion"]["opcion"]
        print(f"  - Pregunta: {r['pregunta'][:50]}... | Respuesta: {ans_val}")

    # 7. Exportar reporte Excel
    response = client.get("/api/encuestas/exportar-excel/")
    assert (
        response.status_code == 200
    ), f"Exportación a Excel fallida: {response.data}"
    print(
        f"¡Exportación a Excel exitosa! Tamaño del archivo: {len(response.content)} bytes."
    )
    print("--- PRUEBAS FINALIZADAS CON ÉXITO ---")


if __name__ == "__main__":
    test_system()
