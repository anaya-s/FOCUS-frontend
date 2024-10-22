from django.urls import path
from .views import ProcessEyeDataView, RetrieveEyeMetricsView

urlpatterns = [
    path('process/', ProcessEyeDataView.as_view(), name='process_eye_data'),
    path('metrics/', RetrieveEyeMetricsView.as_view(), name='retrieve_eye_metrics'),
]
