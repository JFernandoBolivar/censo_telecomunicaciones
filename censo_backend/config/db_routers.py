"""
Database Router para el Sistema de Encuestas de Infraestructura y VGT.

Enruta las operaciones de la app 'geography' a la base de datos 'enviar_db'
y bloquea cualquier escritura o migración sobre ella.
"""

from typing import Any


class EnviadaDatabaseRouter:
    """
    Router que dirige las lecturas de la app 'geography' a la BD enviar_db
    (base de datos ENVIADA del sistema anterior) y bloquea escrituras/migraciones
    sobre ella. Esta BD es de SOLO LECTURA para este sistema.
    """

    ENVIAR_APPS = {"geography"}

    def db_for_read(self, model: type, **hints: Any) -> str | None:
        """Redirige lecturas de geography a la BD enviar_db."""
        if model._meta.app_label in self.ENVIAR_APPS:
            return "enviar_db"
        return None

    def db_for_write(self, model: type, **hints: Any) -> str | None:
        """Bloquea escrituras en la BD enviar_db."""
        if model._meta.app_label in self.ENVIAR_APPS:
            return None
        return None

    def allow_relation(self, obj1: Any, obj2: Any, **hints: Any) -> bool | None:
        """Permite relaciones solo dentro de la misma base de datos."""
        db_set = {obj1._state.db, obj2._state.db}
        if "enviar_db" in db_set and "default" in db_set:
            return False
        return None

    def allow_migrate(
        self, db: str, app_label: str, model_name: str | None = None, **hints: Any
    ) -> bool | None:
        """Nunca ejecutar migraciones sobre la BD enviar_db ni para geography."""
        if app_label in self.ENVIAR_APPS:
            return False
        if db == "enviar_db":
            return False
        return None
