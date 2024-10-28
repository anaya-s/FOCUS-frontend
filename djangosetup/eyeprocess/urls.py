from django.urls import path
from . import views

urlpatterns = [
    path('eyeprocess/', views.eyeprocess, name='eyeprocess'),
]