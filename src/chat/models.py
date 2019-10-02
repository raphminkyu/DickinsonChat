from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()


class Message(models.Model):
    #if the user is deleted, all the messaged related to the user will be deleted
    author = models.ForeignKey(User, related_name = "author_messages", on_delete = models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add = True)


    def __str__(self):
        return self.author.username
    
    #load only the last 10 messages
    def last_10_messages():
        return Message.objects.order_by("-timestamp").all()[:10]
