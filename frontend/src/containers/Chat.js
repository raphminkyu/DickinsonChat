import React from 'react';
import { connect } from 'react-redux';
import WebSocketInstance from '../websocket';
import Hoc from '../hoc/hoc';


class Chat extends React.Component {
    constructor(props) {
        super(props);
        this.state = {messages: ''} //common before react16

    
        this.waitForSocketConnection(() => {
            //messages Callback
            WebSocketInstance.addCallbacks(this.setMessages.bind(this), this.addMessage.bind(this))
            WebSocketInstance.fetchMessages(this.props.currentUser);
        });
    }
    
    waitForSocketConnection(callback) {
        const component = this;
        setTimeout(
            function () {
                 //if it is connected, ready state of one
            if (WebSocketInstance.state() === 1) {
                console.log("Connection is made");
                callback();
                return;
            } else {
                console.log("wait for connection...");
                component.waitForSocketConnection(callback);
            }
        }, 100);//1 millisecond as parameter
    }
    
    addMessage(message) {
        this.setState({ messages: [...this.state.messages, message]});
    }
    
    setMessages(messages) {
        this.setState({ messages: messages.reverse()});
    }

    //everytime you type on facebook
    messageChangeHandler = (event) =>  {
        this.setState({
            message: event.target.value
        })
    }
    
    sendMessageHandler = (e) => {
        e.preventDefault(); //form doesn't reload the page;
        const messageObject = {
            from: "admin",
            content: this.state.message,
        };
        WebSocketInstance.newChatMessage(messageObject);
        this.setState({
            message: ''
        });  //just remove everything from input without reloading
    }
    //helper method for time under renderMessages
    renderTimestamp = timestamp => {
        let prefix = ''; 
        const timeDiff = Math.round((new Date().getTime() - new Date(timestamp).getTime())/60000);
        if (timeDiff < 1) { // less than one minute ago
            prefix = 'just now...';
        } else if (timeDiff < 60 && timeDiff > 1) { // less than sixty minutes ago
            prefix = `${timeDiff} minutes ago`;
        } else if (timeDiff < 24*60 && timeDiff > 60) { // less than 24 hours ago
            prefix = `${Math.round(timeDiff/60)} hours ago`;
        } else if (timeDiff < 31*24*60 && timeDiff > 24*60) { // less than 7 days ago
            prefix = `${Math.round(timeDiff/(60*24))} days ago`;
        } else {
            prefix = `${new Date(timestamp)}`;
        }
        return prefix
    }

    //make funciton to handle messages send an hr ago
    //return a list of list items that will be rendered inside the unorered list
    renderMessages = (messages) => {
        const currentUser = this.props.username;
        //map the messages so that each returns a list
        return messages.map((message, i, arr) => (
            <li 
                key={message.id} 
                style={{marginBottom: arr.length - 1 === i ? '300px' : '15px'}}
                className={message.author === currentUser ? 'sent' : 'replies'}>
                <img src="http://emilcarlsson.se/assets/mikeross.png" />
                <p>{message.content}
                    <br />
                    <small>
                    {this.renderTimestamp(message.timestamp)} 
                    </small>
                </p>
            </li>
        ));
    }

    scrollToBottom = () => {
        this.messagesEnd.scrollIntoView({ behavior: "smooth" });
    }

    componentDidMount() {
        //WebSocketInstance.connect();
        this.scrollToBottom();
    }

    componentDidUpdate() {
        this.scrollToBottom();
    }

    

    render() {
        const messages = this.state.messages;
        return (
            <Hoc>
                <div className="messages">
                    <ul id="chat-log">
                    { 
                        messages && 
                        this.renderMessages(messages) 
                    }
                    <div style={{ float:"left", clear: "both" }}
                        ref={(el) => { this.messagesEnd = el; }}>
                    </div>
                    </ul>
                </div>
                <div className="message-input">
                    <form onSubmit={this.sendMessageHandler}>
                        <div className="wrap">
                            <input 
                                onChange={this.messageChangeHandler}
                                value={this.state.message}
                                required 
                                id="chat-message-input" 
                                type="text" 
                                placeholder="Write your message..." />
                            <i className="fa fa-paperclip attachment" aria-hidden="true"></i>
                            <button id="chat-message-submit" className="submit">
                                <i className="fa fa-paper-plane" aria-hidden="true"></i>
                            </button>
                        </div>
                    </form>
                </div>
            </Hoc>
       
        );
    };
}

const mapStateToProps = state => {
    return {
        username: state.username
    }
}


export default connect(mapStateToProps)(Chat); 