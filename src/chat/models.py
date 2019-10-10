from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()

class Contact(models.Model):
    user = models.ForeignKey(
        User, related_name='friends', on_delete=models.CASCADE)
    friends = models.ManyToManyField('self', blank=True)

    def __str__(self):
        return self.user.username



class Message(models.Model):
    #if the user is deleted, all the messaged related to the user will be deleted
    contact = models.ForeignKey(
        Contact, related_name='messages', on_delete=models.CASCADE, null = True)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.contact.user.username
    


#hold participants of the chat and the messages
class Chat(models.Model):
    #to access specific users, chat, i just need contacts.users.chat
    #get list of chat objects based on related_name = 'chats' 
    participants = models.ManyToManyField(Contact, related_name='chats', blank=True)
    messages = models.ManyToManyField(Message, blank=True)

    def __str__(self):
        return "{}".format(self.pk)