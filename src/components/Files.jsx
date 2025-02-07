import React, { useState } from "react";
import ChatManager from "./ChatManager";
import WebSocketService from "./WebSocketService";

const FileUpload = ({ onClose, currentUser, receiverId,isGroup }) => {
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
      const plainBase64 = base64File.split(",")[1]; // Remove data URI prefix
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
        isGroup: `${isGroup}`
      };
      console.log(fileDTO);
      // Send file via WebSocket
      ChatManager.sendImage(WebSocketService.client, fileDTO,isGroup, () => {
        console.log("File sent successfully.");
      });

      onClose(); // Close modal
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="file-upload-overlay">
      <div className="file-upload-content">
        <h2 className="file-upload-title">Send Image</h2>
        <input className="file-upload-input" type="file" onChange={handleFileChange} />
        <button className="file-upload-button" onClick={handleUpload} disabled={uploading}>
          {uploading ? "Uploading..." : "Upload"}
        </button>
        <button className="file-upload-close-button" onClick={onClose}>×</button>
      </div>
    </div>
  );
};

export default FileUpload;
