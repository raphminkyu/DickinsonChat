from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()

class Contact(models.Model):
    user = models.ForeignKey(User, related_name = 'friends', on_delete = models.CASCADE)
    friends = models.ManyToManyField('self', blank = True)

    def __str__(self):
        return self.user.username



class Message(models.Model):
    #if the user is deleted, all the messaged related to the user will be deleted
    contact = models.ForeignKey(Contact, related_name = "messages", on_delete = models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add = True)


    def __str__(self):
        return self.contact.user.username
    


#hold participants of the chat and the messages
class Chat(models.Model):
    #to access specific users, chat, i just need contacts.users.chat
    participants = models.ManyToManyField(Contact, related_name = 'chats')
    messages = models.ManyToManyField(Message, blank = True)

    #load only the last 10 messages
    #added self parameter cause it now loads the messages for that specific chat
    def last_10_messages(self):
        return self.messages.objects.order_by("-timestamp").all()[:10]

    def __str__(self):
        #return primary key
        return "{}".format(self.pk)

