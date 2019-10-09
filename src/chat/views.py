from django.shortcuts import render , get_object_or_404
from.models import Chat

#load only the last 10 messages
#added self parameter cause it now loads the messages for that specific chat
def get_last_10_messages(chatId):
    chat = get_object_or_404(Chat, id=chatId)
    return chat.messages.order_by('-timestamp').all()[:10]