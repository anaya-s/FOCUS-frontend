from django.db import models
from django.contrib.auth.models import User

class EyeMetrics(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    session_id = models.CharField(max_length=100)
    blink_count = models.IntegerField()
    eye_aspect_ratio_avg = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - Session {self.session_id}"
