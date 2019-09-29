# chat/consumers.py
from django.contrib.auth import get_user_model
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from .models import Message
import json

User = get_user_model

class ChatConsumer(WebsocketConsumer):

    #When you send a message, a command will dictate what will happen with the message
    def fetch_messages(self, data):
        messages = Messages.last_10_messages()
        content = {
            'messages':self.messages_to_json(messages)
        }
        #send the message out
        self.send_message(content)

    def new_message(self, data):
        author = data['from']
        author_user = User.object.filter(username = author)[0]
        message = Message.objects.create(
            author = author_user, content = data['message'])
        content = {
            'command':'new_message',
            #grabbing one message
            'message':self.message_to_json(message)
        }
        return self.send_chat_message(content)


    #helper method to add a list of the last 10 messages
    def messages_to_json(messages):
        result = []
        for message in messages:
            result.append(self.message_to_json(message))
        return result 

    #return an object for each message passed in 
    #make message an object of json
    def message_to_json(self, message):
         return {
             "author": message.author.username,
             "content": message.content,
             "timestamp": str(message.timestamp)

         }

    commands = {
        'fetch_messages': fetch_messages,
        'new_message': new_message
    }

    #adds user to group
    def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'chat_%s' % self.room_name

        # Join room group
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )

        self.accept()

    def disconnect(self, close_code):
        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket

    #grab command in command 
    def receive(self, text_data):
        data = json.loads(text_data)
        self.commands[data['command']](self, data)

    def send_chat_message(self, message):
        # Send message to room group
        async_to_sync(self.channel_layer.group_send)(
        #await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message
            }
        )
    def send_message(self, message):
        self.send(text_data=json.dumps(message))


    # Receive message from room group
    def chat_message(self, event):
        message = event['message']

        # Send message to WebSocket
        self.send(text_data=json.dumps(message))
        