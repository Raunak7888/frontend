import React, { useState, useEffect, useCallback } from "react";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import WebSocketService from "./WebSocketService";
import ChatUtil from "./ChatUtil";

const Ok = () => {
  const [selectedUserId, setSelectedUserId] = useState(() => {
    const savedUserId = localStorage.getItem("selectedUserId");
    return savedUserId ? JSON.parse(savedUserId) : null;
  });
  const [selectedUsername, setSelectedUsername] = useState(() => {
    const savedUsername = localStorage.getItem("selectedUsername");
    return savedUsername ? JSON.parse(savedUsername) : null;
  });
  const [isGroup, setIsGroup] = useState(() => {
    const savedIsGroup = localStorage.getItem("isGroup");
    return savedIsGroup ? JSON.parse(savedIsGroup) : null;
  });

  // Initialize WebSocket connection on mount
  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("Authorization="))
      ?.split("=")[1];

    if (token && !WebSocketService.client?.connected) {
      WebSocketService.connect(
        () => console.log("WebSocket connected"),
        (error) => console.error("WebSocket connection error:", error),
        token
      );
    }
  }, []);

  // Handle user selection for chats
  const handleUserSelect = useCallback(
    (id, name, isGroup) => {
      if (
        id !== selectedUserId ||
        name !== selectedUsername ||
        isGroup !== isGroup
      ) {
        setSelectedUserId(id);
        setSelectedUsername(name);
        setIsGroup(isGroup);

        localStorage.setItem("selectedUserId", JSON.stringify(id));
        localStorage.setItem("selectedUsername", JSON.stringify(name));
        localStorage.setItem("isGroup", JSON.stringify(isGroup));
      }
    },
    [selectedUserId, selectedUsername, isGroup]
  );

  return (
    <div className="chat-container">
      <div className="sidebar">
        <ChatList onChatSelect={handleUserSelect} />
      </div>
      <div className="chat-area">
        {WebSocketService.client?.connected &&
        selectedUserId &&
        selectedUsername ? (
          <ChatWindow
            recipientId={selectedUserId}
            recipientUsername={selectedUsername}
            isGroup={isGroup}
            ready={WebSocketService.client?.connected}
          />
        ) : (
          <div className="no-chat">Select a user to start chatting</div>
        )}
      </div>
      <div className="chat-help-utils">
        <ChatUtil />
      </div>
    </div>
  );
};

export default Ok;
