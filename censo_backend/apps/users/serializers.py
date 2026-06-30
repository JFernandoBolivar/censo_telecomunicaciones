from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Usuario

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ('id', 'email', 'nombre_empresa', 'rif_empresa', 'is_active', 'is_staff', 'fecha_creacion')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = Usuario
        fields = ('email', 'nombre_empresa', 'rif_empresa', 'password')

    def validate_email(self, value):
        if Usuario.objects.filter(email=value).exists():
            raise serializers.ValidationError("El email ya está registrado.")
        return value

    def validate_rif_empresa(self, value):
        if value and Usuario.objects.filter(rif_empresa=value).exists():
            raise serializers.ValidationError("El RIF ya está registrado.")
        return value

    def create(self, validated_data):
        return Usuario.objects.create_user(
            email=validated_data['email'],
            nombre_empresa=validated_data['nombre_empresa'],
            password=validated_data['password'],
            rif_empresa=validated_data.get('rif_empresa', ''),
        )


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        user = authenticate(request=self.context.get('request'), email=email, password=password)

        if not user:
            raise serializers.ValidationError("Credenciales inválidas.", code='authorization')

        if not user.is_active:
            raise serializers.ValidationError("Esta cuenta está desactivada.", code='authorization')

        attrs['user'] = user
        return attrs

    def get_tokens(self):
        user = self.validated_data['user']
        refresh = RefreshToken.for_user(user)
        user_data = UsuarioSerializer(user).data
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': user_data,
        }
