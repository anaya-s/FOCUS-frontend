from django.db import models
from django.contrib.auth.models import User

class SessionData(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    blink_count = models.IntegerField()
    eye_aspect_ratio_avg = models.FloatField()

    def __str__(self):
        return f"Session {self.id} - User: {self.user.username}"
