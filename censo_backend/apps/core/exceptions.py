from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

def custom_exception_handler(exc, context):
    # Llama al manejador de excepciones por defecto de DRF primero,
    # para obtener la respuesta estándar.
    response = exception_handler(exc, context)

    # Si la excepción fue manejada por DRF (e.g. ValidationError, NotFound)
    if response is not None:
        custom_data = {
            "status": "error",
            "message": "Ha ocurrido un error en la validación.",
            "data": None
        }

        # Si es un ValidationError de DRF (HTTP 400), iteramos los errores para 
        # armar un mensaje más amigable o pasamos los detalles en data.
        if response.status_code == status.HTTP_400_BAD_REQUEST:
            errors = response.data
            
            # Buscar el primer error para mostrarlo en el message (como hace `extract_first_error`)
            first_error_msg = custom_data["message"]
            if isinstance(errors, dict):
                first_key = next(iter(errors))
                if isinstance(errors[first_key], list):
                    first_error_msg = f"{first_key}: {errors[first_key][0]}"
                else:
                    first_error_msg = f"{first_key}: {errors[first_key]}"
            elif isinstance(errors, list):
                first_error_msg = str(errors[0])
                
            custom_data["message"] = first_error_msg
            custom_data["data"] = errors # Enviamos los errores detallados en data
            
        elif 'detail' in response.data:
            custom_data["message"] = response.data['detail']
            
        response.data = custom_data

    # Si la excepción no fue manejada por DRF (e.g. un Exception crudo)
    else:
        # Aquí puedes decidir si atrapar errores 500 y no mostrarlos al usuario
        # O retornarlos como DRF. En desarrollo, es útil verlos.
        pass

    return response
