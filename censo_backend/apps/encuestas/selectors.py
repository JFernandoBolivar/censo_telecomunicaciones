from apps.encuestas.models.models_encuestas import Configuracion, PreguntaPersonalizada

def obtener_configuracion_activa():
    """Obtiene la configuración de encuesta más reciente/activa."""
    return Configuracion.objects.order_by("-fecha_creacion").first()

def obtener_preguntas_por_configuracion(configuracion):
    """Devuelve las preguntas asociadas a una configuración, optimizadas para listar."""
    return (
        PreguntaPersonalizada.objects
        .filter(configuracion=configuracion)
        .select_related("tipo_pregunta", "seccion")
        .prefetch_related("opciones", "seleccionables")
        .order_by("seccion__id", "id")
    )

def obtener_preguntas_con_respuestas(configuracion):
    """Devuelve las preguntas asociadas a una configuración, optimizadas para incluir respuestas del usuario."""
    return (
        PreguntaPersonalizada.objects
        .filter(configuracion=configuracion)
        .select_related("tipo_pregunta", "seccion")
        .prefetch_related("opciones", "seleccionables", "usuariopermiso_set")
        .order_by("seccion__id", "id")
    )

import json
from apps.encuestas.models.models_encuestas import UsuarioPermiso

def obtener_todas_las_respuestas_agrupadas(configuracion):
    """
    Retorna una lista de usuarios con sus respectivas respuestas limpias.
    Lista todas las preguntas; las no respondidas tendrán respuesta=None.
    """
    from apps.encuestas.models.models_encuestas import PreguntaPersonalizada
    todas_las_preguntas = list(
        PreguntaPersonalizada.objects
        .filter(configuracion=configuracion)
        .select_related("tipo_pregunta")
        .order_by("seccion__id", "id")
    )
    
    permisos = (
        UsuarioPermiso.objects
        .filter(pregunta_personalizada__configuracion=configuracion)
        .select_related("usuario", "pregunta_personalizada", "pregunta_personalizada__tipo_pregunta")
        .prefetch_related("respuestaencuesta_set", "respuestaopciones_set__pregunta_opciones")
        .order_by("usuario__id")
    )
    
    usuarios_map = {}
    respuestas_map = {}
    
    for permiso in permisos:
        user_id = permiso.usuario.id
        if user_id not in usuarios_map:
            usuarios_map[user_id] = {
                "id": user_id,
                "email": permiso.usuario.email,
                "nombre_empresa": permiso.usuario.nombre_empresa,
                "rif_empresa": permiso.usuario.rif_empresa,
            }
            respuestas_map[user_id] = {}
            
        pregunta = permiso.pregunta_personalizada
        
        textos = list(permiso.respuestaencuesta_set.all())
        opciones = list(permiso.respuestaopciones_set.all())
        
        valor = None
        if textos:
            # Si hay múltiples textos, recolectamos todos (para zonas geográficas)
            if pregunta.tipo_pregunta.nombre == "seleccion geografica":
                parsed_list = []
                for t in textos:
                    raw_text = t.respuesta.strip()
                    # Intento reparar JSON mal concatenado como {"a":"b"}{"c":"d"} si ocurre
                    if "}{" in raw_text:
                        raw_text = raw_text.replace("}{", "},{")
                        raw_text = f"[{raw_text}]"
                    
                    try:
                        parsed = json.loads(raw_text)
                        if isinstance(parsed, list):
                            parsed_list.extend(parsed)
                        else:
                            parsed_list.append(parsed)
                    except Exception:
                        parsed_list.append(t.respuesta)
                valor = parsed_list if len(parsed_list) > 1 else (parsed_list[0] if parsed_list else None)
            else:
                valor = textos[0].respuesta
                
        elif opciones:
            opciones_nombres = [o.pregunta_opciones.opcion for o in opciones]
            if pregunta.tipo_pregunta.nombre == "seleccion multiple":
                valor = opciones_nombres
            else:
                valor = opciones_nombres[0] if len(opciones_nombres) == 1 else opciones_nombres
                
        respuestas_map[user_id][pregunta.id] = valor

    resultado = []
    for user_id, info_usuario in usuarios_map.items():
        user_respuestas = []
        for p in todas_las_preguntas:
            codigo = p.validacion.get("codigo") if isinstance(p.validacion, dict) else None
            valor_respuesta = respuestas_map[user_id].get(p.id, None)
            
            user_respuestas.append({
                "pregunta_id": p.id,
                "codigo": codigo,
                "enunciado": p.titulo,
                "tipo": p.tipo_pregunta.nombre,
                "respuesta": valor_respuesta
            })
            
        resultado.append({
            "usuario": info_usuario,
            "respuestas": user_respuestas
        })
        
    return resultado
