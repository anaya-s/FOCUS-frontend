from rest_framework import views
from rest_framework.response import Response
from .serializers import VideoDataSerializer

class ProcessEyeDataView(views.APIView):
    def post(self, request):
        serializer = VideoDataSerializer(data=request.data)
        if serializer.is_valid():
            # Perform eye data processing here
            processed_metrics = process_eye_data(request.data['video_frame'])
            return Response(processed_metrics)
        return Response(serializer.errors, status=400)

class RetrieveEyeMetricsView(views.APIView):
    def get(self, request):
        # placeholder for metrics - add others later
        metrics = {
            'blink_count': 12,
            'eye_aspect_ratio': 0.25,
        }
        return Response(metrics)
