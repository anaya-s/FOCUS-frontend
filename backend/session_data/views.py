from rest_framework import generics
from .models import SessionData
from .serializers import SessionDataSerializer
from rest_framework.permissions import IsAuthenticated

class CreateSessionView(generics.CreateAPIView):
    queryset = SessionData.objects.all()
    serializer_class = SessionDataSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Automatically set the session's user to the currently authenticated user
        serializer.save(user=self.request.user)

class RetrieveSessionDataView(generics.ListAPIView):
    serializer_class = SessionDataSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only return sessions that belong to the currently authenticated user
        return SessionData.objects.filter(user=self.request.user)
