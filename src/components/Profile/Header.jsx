import React from 'react';
import { Target, Camera } from "lucide-react";
import "./Header.css"

export default function Header({
  userData,
  profilePicture,
  triggerFileInput,
  uploadingPhoto,
  fileInputRef,
  handlePhotoUpload,
  getFullName,
  translateValue,
  menuVisible,
  setMenuVisible
}) {
  return (
    <header className="header-banner">
      <div className="header-overlay">
        <div className="header-content">
          <div className="profile-avatar">
            <div className="avatar-container">
              <img
                src={profilePicture || "/placeholder.svg?height=96&width=96"}
                alt={userData.login}
                className="avatar-image"
              />
              <button className="avatar-upload-button" onClick={triggerFileInput} disabled={uploadingPhoto}>
                {uploadingPhoto ? <div className="loading-spinner-tiny"></div> : <Camera size={16} />}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/jpeg,image/png,image/gif"
                style={{ display: "none" }}
              />
            </div>
            <div className="profile-name">
              <h1>{getFullName(userData)}</h1>
              {userData.aim && (
                <p className="profile-aim">
                  <Target size={16} className="aim-icon" />
                  {translateValue(userData.aim, "aim")}
                </p>
              )}
            </div>
          </div>

          <button
            className="menu-button"
            onClick={() => setMenuVisible(!menuVisible)}
            aria-label={menuVisible ? "Закрыть меню" : "Открыть меню"}
          >
            {menuVisible ? "✕" : "☰"}
          </button>
        </div>
      </div>
    </header>
  );
}
