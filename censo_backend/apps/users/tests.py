from django.core.exceptions import FieldDoesNotExist
from django.test import TestCase

from .models import Usuario
from .serializers import UsuarioSerializer


class UsuarioTests(TestCase):
    def test_is_superuser_field_is_not_present(self):
        with self.assertRaises(FieldDoesNotExist):
            Usuario._meta.get_field("is_superuser")

    def test_serializer_includes_is_staff(self):
        user = Usuario.objects.create_user(
            email="admin@example.com",
            nombre_empresa="Empresa Test",
            password="secret123",
            is_staff=True,
        )

        serializer = UsuarioSerializer(user)

        self.assertTrue(serializer.data["is_staff"])
