import React, { useState, useEffect, useCallback } from "react";
import { searchUsers } from "./api";

const ChatList = ({ onChatSelect }) => {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [chatList, setChatList] = useState(() => {
    return JSON.parse(localStorage.getItem("chatList")) || [];
  });
  const [activeChat, setActiveChat] = useState(null);

  // Handle search input change
  const handleSearchChange = useCallback(async (e) => {
    const newQuery = e.target.value.trim();
    setQuery(newQuery);

    if (newQuery) {
      try {
        const results = await searchUsers(newQuery);
        setSearchResults(results || []);
      } catch (error) {
        console.error("Error searching users/groups:", error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  }, []);

  // Add a chat to the list and set it as active
  const handleChatSelect = useCallback(
    (chat) => {
      if (
        !chatList.some(
          (item) => item.id === chat.id && item.group === chat.group
        )
      ) {
        const updatedList = [...chatList, chat];
        setChatList(updatedList);
        localStorage.setItem("chatList", JSON.stringify(updatedList));
      }

      setActiveChat(chat);
      setSearchResults([]);
      setQuery("");
      onChatSelect(chat.id, chat.name, chat.group);
    },
    [chatList, onChatSelect]
  );

  // Handle click on an existing chat
  const handleChatListClick = useCallback(
    (chat) => {
      setActiveChat(chat);
      onChatSelect(chat.id, chat.name, chat.group);
      console.log("Chat clicked:");
    },
    [onChatSelect]
  );

  // Effect for logging updates to the chat list (optional for debugging)
  useEffect(() => {
    console.log("Updated Chat List:", chatList);
  }, [chatList]);

  return (
    <div className="chat-sidebar">
      <div className="chat-sidebar-header">
        <h1>Chat App</h1>
      </div>
      <div className="chat-sidebar-search">
        <input
          type="text"
          placeholder="Search users or groups"
          value={query}
          onChange={handleSearchChange}
          className="search-input"
        />
        {searchResults.length > 0 && (
          <div className="search-results">
            {searchResults.map((chat) => (
              <div
                key={`${chat.id}-${chat.group}`}
                className="search-result-item"
                onClick={() => handleChatSelect(chat)}
              >
                {chat.name}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="chat-list">
        {chatList.length > 0 ? (
          chatList.map((chat) => (
            <div
              key={`${chat.id}-${chat.group}`}
              className={`chat-list-item ${
                activeChat?.id === chat.id && activeChat?.group === chat.group
                  ? "active"
                  : ""
              }`}
              onClick={() => handleChatListClick(chat)}
            >
              <span className="chat-name">{chat.name}</span>
            </div>
          ))
        ) : (
          <div className="chat-list-item">No active chats</div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
