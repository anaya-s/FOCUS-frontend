from rest_framework.permissions import IsAuthenticated
from rest_framework import generics
from .serializers import UserSerializer
from django.contrib.auth.models import User

class UserProfileView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

class RegisterUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
