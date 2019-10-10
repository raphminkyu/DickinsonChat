import React from "react";
import { connect } from "react-redux";
import WebSocketInstance from "../websocket";
import Hoc from "../hoc/hoc";


class Chat extends React.Component {
    state = { message: "" };

    initialiseChat() {
        this.waitForSocketConnection(() => {
          // WebSocketInstance.addCallbacks(
          //   this.props.setMessages.bind(this),
          //   this.props.addMessage.bind(this)
          // );
          WebSocketInstance.fetchMessages(
            this.props.username,
            this.props.match.params.chatID
          );
        });
        WebSocketInstance.connect(this.props.match.params.chatID);
      }
    constructor(props) {
        super(props);
        this.initialiseChat();   
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
    
 
    //everytime you type on facebook
    messageChangeHandler = (event) =>  {
        this.setState({ message: event.target.value });
    }
    
    sendMessageHandler = e => {
        e.preventDefault();
        const messageObject = {
          from: this.props.username,
          content: this.state.message,
          chatId: this.props.match.params.chatID
        };
        WebSocketInstance.newChatMessage(messageObject);
        this.setState({ message: "" });
      };

    //helper method for time under renderMessages
    renderTimestamp = timestamp => {
    let prefix = "";
    const timeDiff = Math.round(
      (new Date().getTime() - new Date(timestamp).getTime()) / 60000
    );
    if (timeDiff < 1) {
      // less than one minute ago
      prefix = "just now...";
    } else if (timeDiff < 60 && timeDiff > 1) {
      // less than sixty minutes ago
      prefix = `${timeDiff} minutes ago`;
    } else if (timeDiff < 24 * 60 && timeDiff > 60) {
      // less than 24 hours ago
      prefix = `${Math.round(timeDiff / 60)} hours ago`;
    } else if (timeDiff < 31 * 24 * 60 && timeDiff > 24 * 60) {
      // less than 7 days ago
      prefix = `${Math.round(timeDiff / (60 * 24))} days ago`;
    } else {
      prefix = `${new Date(timestamp)}`;
    }
    return prefix;
  };

    //make funciton to handle messages send an hr ago
    //return a list of list items that will be rendered inside the unorered list
    renderMessages = messages => {
        const currentUser = this.props.username;
        return messages.map((message, i, arr) => (
          <li
            key={message.id}
            style={{ marginBottom: arr.length - 1 === i ? "300px" : "15px" }}
            className={message.author === currentUser ? "sent" : "replies"}
          >
            <img src="http://emilcarlsson.se/assets/mikeross.png" />
            <p>
              {message.content}
              <br />
              <small>{this.renderTimestamp(message.timestamp)}</small>
            </p>
          </li>
        ));
      };

   


      scrollToBottom = () => {
        this.messagesEnd.scrollIntoView({ behavior: "smooth" });
      };
    
      componentDidMount() {
        this.scrollToBottom();
      }
    
      componentDidUpdate() {
        this.scrollToBottom();
      }

      componentWillReceiveProps(newProps) {
        if (this.props.match.params.chatID !== newProps.match.params.chatID) {
          WebSocketInstance.disconnect();
          this.waitForSocketConnection(() => {
            WebSocketInstance.fetchMessages(
              this.props.username,
              newProps.match.params.chatID
            );
          });
          WebSocketInstance.connect(newProps.match.params.chatID);
        }
      }

      render() {
        const messages = this.state.messages;
        return (
          <Hoc>
            <div className="messages">
              <ul id="chat-log">
                {this.props.messages && this.renderMessages(this.props.messages)}
                <div
                  style={{ float: "left", clear: "both" }}
                  ref={el => {
                    this.messagesEnd = el;
                  }}
                />
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
                    placeholder="Write your message..."
                  />
                  <i className="fa fa-paperclip attachment" aria-hidden="true" />
                  <button id="chat-message-submit" className="submit">
                    <i className="fa fa-paper-plane" aria-hidden="true" />
                  </button>
                </div>
              </form>
            </div>
          </Hoc>
        );
      }
    }

const mapStateToProps = state => {
    return {
        username: state.auth.username,
        messages: state.message.messages
      };
    };
    
export default connect(mapStateToProps)(Chat);