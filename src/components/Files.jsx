import React, { useState } from "react";
import ChatManager from "./ChatManager";
import WebSocketService from "./WebSocketService";

const FileUpload = ({ onClose,currentUser,receiverId,setMessages }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }
  
    setUploading(true);
    setUploadStatus("");
  
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64File = e.target.result;
  
      const fileDTO = {
        file: base64File, // Encoded file
        fileName: file.name,
        fileType: file.type,
        userId: currentUser,
        receiverId: receiverId,
        tempID: Date.now(),
        status: "pending",
      };
  
      ChatManager.sendImage(
        WebSocketService.client,
        fileDTO,
        (response) => {
          if (response.success) {
            setMessages((prevMessages) => [...prevMessages, response]);
            setUploadStatus("File uploaded successfully!");
          } else {
            setUploadStatus("Failed to upload file.");
          }
          setUploading(false);
        }
      );
    };
  
    reader.readAsDataURL(file); // Converts the file to a base64 string
  };
  
  

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.content}>
        <h2 style={modalStyles.h2}>Upload a File</h2>
        <input
          className="fileChooser"
          style={modalStyles.input}
          type="file"
          onChange={handleFileChange}
        />
        <button
          className="card-button"
          style={modalStyles.button}
          onClick={handleUpload}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
        {uploadStatus && <p>{uploadStatus}</p>}
        <button
          className="closeButton"
          onClick={onClose}
          style={modalStyles.closeButton}
        >
          x
        </button>
      </div>
    </div>
  );
};

// Modal styles
const modalStyles = {
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
    color: "#FFF",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    position: "relative",
    width: "30%",
    height: "40%",
    padding: "20px",
    backgroundColor: "#1e2124",
    borderRadius: "5px",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.3)",
  },
  closeButton: {
    position: "absolute",
    top: "5px",
    right: "10px",
    padding: "0px",
    color: "white",
    border: "none",
    width: "30px",
    height: "30px",
    borderRadius: "50px",
    cursor: "pointer",
  },
};

export default FileUpload;
