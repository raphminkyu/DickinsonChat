#serializer takes a query set and turns it into json
#serializer will be chat
from rest_framework import serializers

from chat.models import Chat


class ChatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chat
        fields = ('__all__')