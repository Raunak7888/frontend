import React, { useState, useEffect, useRef, useCallback } from "react";
import WebSocketService from "./WebSocketService";
import OnlineStatusService from "./OnlineStatusService";
import ChatManager from "./ChatManager";
import { getCurrentUserWithToken, fetchMessagesUntilLastDay } from "./api";
import FileUpload from "./Files";
import FileView from "./FilesView";

const ChatWindow = ({ recipientId, recipientUsername, isGroup }) => {
  const [messages, setMessages] = useState([]);
  const [messageContent, setMessageContent] = useState("");
  const [status, setStatus] = useState("Unknown");
  const [currentUser, setCurrentUser] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);

  const chatEndRef = useRef(null);

  const toggleModal = () => {
    setModalOpen(!isModalOpen);
  };

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const userId = await getCurrentUserWithToken();
        setCurrentUser(userId);
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };
    initializeUser();
  }, []);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = useCallback(async () => {
    if (!recipientId || !currentUser || currentUser === recipientId) return;

    try {
      const previousMessages = await fetchMessagesUntilLastDay(
        currentUser,
        recipientId,
        isGroup
      );
      setMessages(previousMessages);
    } catch (error) {
      console.error("Error fetching previous messages:", error);
    }
  }, [recipientId, currentUser, isGroup]);

  useEffect(() => {
    if (!recipientId || !currentUser || currentUser === recipientId) {
      return;
    }

    loadMessages();

    const messageSubscription = ChatManager.subscribeToMessages(
      WebSocketService.client,
      currentUser,
      (newMessage) => {
        if (
          (isGroup && newMessage.groupId === recipientId) ||
          (!isGroup && newMessage.senderId === recipientId)
        ) {
          setMessages((prev) => {
            const exists = prev.some((msg) => msg.tempId === newMessage.tempId);
            return exists ? prev : [...prev, newMessage];
          });
        }
      },
      isGroup,
      recipientId
    );

    const senderSubscription = ChatManager.subscribeToSender(
      WebSocketService.client,
      currentUser,
      (ackMessage) => {
        const { tempId, status } = ackMessage;
        setMessages((prev) =>
          prev.map((msg) => (msg.tempId === tempId ? { ...msg, status } : msg))
        );
      },
      isGroup,
      recipientId
    );

    if (!isGroup) {
      const statusSubscription = OnlineStatusService.subscribeToStatusUpdates(
        WebSocketService.client,
        recipientId,
        setStatus
      );

      OnlineStatusService.requestUserStatus(
        WebSocketService.client,
        recipientId
      );

      return () => {
        statusSubscription.unsubscribe();
        messageSubscription.unsubscribe();
        senderSubscription.unsubscribe();
      };
    }

    return () => {
      messageSubscription.unsubscribe();
      senderSubscription.unsubscribe();
    };
  }, [recipientId, currentUser, isGroup, loadMessages]);

  const handleKeyPress = (e) => {
    console.log(`Key pressed: ${e.key}`); // Debugging line
    if (e.key === "Enter") {
      handleSendClick();
    }
  };

  const handleSendClick = useCallback(() => {
    if (messageContent.trim() && currentUser) {
      const tempId = Date.now();
      const messageDTO = {
        senderId: currentUser,
        receiverId: recipientId,
        groupId: recipientId,
        content: messageContent,
        isGroup,
        tempId,
        status: "pending",
      };

      setMessages((prev) => [...prev, messageDTO]);

      ChatManager.sendMessage(
        WebSocketService.client,
        messageDTO,
        (response) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.tempId === tempId
                ? { ...msg, status: response.success ? "sent" : "failed" }
                : msg
            )
          );
        }
      );

      setMessageContent("");
    }
  }, [messageContent, recipientId, isGroup, currentUser]);

  return (
    <div className="chat-area">
      <div className="chat-header">
        <span className="chat-contact-name">
          {recipientUsername.charAt(0).toUpperCase() +
            recipientUsername.slice(1) || "Group Chat"}
        </span>
        <br />
        {!isGroup && (
          <span className={`chat-status ${status.toLowerCase()}`}>
            {status}
          </span>
        )}
      </div>

      <div className="message-display">
        {messages.map((msg, index) => (
          <div key={msg.id || `msg-${index}`}>
            {msg.content === "---FILE---" ? (
              <FileView filename={msg.fileName} isSent={msg.senderId == currentUser}/>
            ) : (
              <div
                className={
                  msg.senderId == currentUser
                    ? "message-sent"
                    : "message-received"
                }
              >
                {msg.content}
                {msg.senderId == currentUser && (
                  <span className="message-status">
                    {msg.status === "pending" ? "❌" : "✅"}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="input-area">
        <button className="file-button" onClick={toggleModal}>
          <span>+</span>
        </button>

        {/* Show the FileUpload modal when isModalOpen is true */}
        {isModalOpen && <FileUpload onClose={toggleModal} currentUser={currentUser} receiverId={recipientId} setMessages={setMessages} />}
        <input
          type="text"
          className="message-input"
          placeholder="Type a message"
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <button className="send-button" onClick={handleSendClick}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
