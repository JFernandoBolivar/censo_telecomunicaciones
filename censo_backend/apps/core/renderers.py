from rest_framework.renderers import JSONRenderer

class CustomJSONRenderer(JSONRenderer):
    def render(self, data, accepted_media_type=None, renderer_context=None):
        # Si la respuesta es None, inicializar como diccionario vacío
        if data is None:
            data = {}

        # Determinar si la respuesta fue exitosa
        response = renderer_context.get('response') if renderer_context else None
        
        status_code = response.status_code if response else 200
        is_success = 200 <= status_code < 400

        # Si los datos ya vienen con nuestro formato (porque alguna vista lo hizo manualmente o fue un error),
        # lo devolvemos tal cual para no envolver doble.
        if isinstance(data, dict) and 'status' in data and 'message' in data and 'data' in data:
            return super().render(data, accepted_media_type, renderer_context)

        # Determinar el mensaje por defecto basado en el status code
        message = "Operación exitosa" if is_success else "Ha ocurrido un error"

        # Formato de respuesta estándar
        custom_data = {
            "status": "success" if is_success else "error",
            "message": data.get('message', message) if isinstance(data, dict) and 'message' in data else message,
            "data": data.get('data', data) if isinstance(data, dict) and 'data' in data else data
        }

        # Si hubo un error y DRF envió 'detail', podemos usarlo como mensaje principal
        if not is_success and isinstance(data, dict) and 'detail' in data:
            custom_data['message'] = data.pop('detail')
            custom_data['data'] = data if data else None

        return super().render(custom_data, accepted_media_type, renderer_context)
