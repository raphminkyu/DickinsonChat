class WebSocketService {
    static instance = null;
    callbacks = {};
  
    static getInstance() {
      if (!WebSocketService.instance) {
        WebSocketService.instance = new WebSocketService();
      }
      return WebSocketService.instance;
    }
  
    constructor() {
      this.socketRef = null;
    }
  
  //connect websocet
      // set function when websocket is opened/connected
    connect() {
      const path = 'ws://127.0.0.1:8000/ws/chat/test/';
      this.socketRef = new WebSocket(path);
      this.socketRef.onopen = () => {
        console.log('WebSocket open');
      };
      this.socketNewMessage(JSON.stringify({
        command: 'fetch_messages'
      }));
      this.socketRef.onmessage = e => {
        this.socketNewMessage(e.data);
      };
      this.socketRef.onerror = e => {
        console.log(e.message);
      };
      this.socketRef.onclose = () => {
        console.log("WebSocket closed let's reopen");
        this.connect();
      };
    }
  
    socketNewMessage(data) {
      const parsedData = JSON.parse(data);
       //fetch message or recieve
      const command = parsedData.command;
        // having 0 commdnad
      if (Object.keys(this.callbacks).length === 0) {
        return;
      }
      if (command === 'messages') {
        this.callbacks[command](parsedData.messages);
      }
      if (command === 'new_message') {
        this.callbacks[command](parsedData.message);
      }
    }
  
    fetchMessages(username) {
      this.sendMessage({ command: 'fetch_messages', username: username });
    }
  
    newChatMessage(message) {
      this.sendMessage({ command: 'new_message', from: message.from, message: message.content }); 
    }
  
  //helper method
      //access websockets and add callbacks
    addCallbacks(messagesCallback, newMessageCallback) {
      this.callbacks['messages'] = messagesCallback;
      this.callbacks['new_message'] = newMessageCallback;
    }
    
    sendMessage(data) {
      try {
          //use socket reference and send our data
              //grabbing all the data and creating a shadow clone of it
        this.socketRef.send(JSON.stringify({ ...data }));
      }
      catch(err) {
        console.log(err.message);
      }  
    }
   //helpermethod
    state() {
      return this.socketRef.readyState;
    }
    //this refers to the entire class
      //continuously called until we are connected
     
  
  }
  
  const WebSocketInstance = WebSocketService.getInstance();
  
  export default WebSocketInstance;