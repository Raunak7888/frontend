import React, { useState } from "react";
import ChatManager from "./ChatManager";
import WebSocketService from "./WebSocketService";

const FileUpload = ({ onClose, currentUser, receiverId, setMessages,isMobile }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    setUploading(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64File = e.target.result;

      // Remove the prefix (e.g., "data:image/png;base64,")
      const plainBase64 = base64File.split(",")[1];
      const filenameWithNoSpace = file.name.replace(/\s+/g, "");

      const tempId = Date.now();

      const fileDTO = {
        file: plainBase64,
        fileName: filenameWithNoSpace,
        fileType: file.type,
        fileSize: file.size,
        userId: currentUser,
        receiverId: receiverId,
        tempId: tempId,
        status: "pending",
      };

      


      // Add the file immediately to the chat UI with a "pending" status
      

      // Send the file to the server
      ChatManager.sendImage(
        WebSocketService.client,
        fileDTO,
        () => {
          console.log("File sent successfully.");
        }
      );

      // Close the modal after uploading
      onClose();
    };

    reader.readAsDataURL(file); // Converts the file to a base64 string
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.content}>
        <h2 style={styles.h2}>Upload a File</h2>
        <input
          className="fileChooser"
          style={styles.input}
          type="file"
          onChange={handleFileChange}
        />
        <button
          className="card-button"
          style={styles.button}
          onClick={handleUpload}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
        <button
          className="closeButton"
          onClick={onClose}
          style={styles.closeButton}
        >
          x
        </button>
      </div>
    </div>
  );
};

// Modal styles
const styles = {
  h2: {
    marginBottom: "20px",
    textAlign: "center",
    color: "#87cbf4",
    fontSize: "30px",
    fontWeight: "bold",
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    position: "relative",
    width: "30%",
    padding: "20px",
    backgroundColor: "#1e2124",
    borderRadius: "5px",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.3)",
  },
  input: {
    width: "100%",
    marginBottom: "10px",
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  button: {
    width: "100%",
    padding: "10px",
    borderRadius: "5px",
    backgroundColor: "#87cbf4",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
  },
  closeButton: {
    position: "absolute",
    top: "5px",
    right: "10px",
    padding: "5px",
    color: "white",
    border: "none",
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    cursor: "pointer",
    backgroundColor: "#ff5f5f",
  },
};

export default FileUpload;
