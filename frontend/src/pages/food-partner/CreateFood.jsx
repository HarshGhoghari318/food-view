import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import "../../style/create-food.css";
import { useNavigate } from "react-router-dom";

const CreateFood = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [videoURL, setVideoURL] = useState("");
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef(null);

  const navigate = useNavigate();

  // Upload / UI feedback state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });
  const toastTimerRef = useRef(null);

  // Lock scroll while uploading
  useEffect(() => {
    document.body.classList.toggle("uploading", isUploading);
    return () => document.body.classList.remove("uploading");
  }, [isUploading]);

  useEffect(() => {
    if (!videoFile) {
      setVideoURL("");
      return;
    }
    const url = URL.createObjectURL(videoFile);
    setVideoURL(url);
    return () => URL.revokeObjectURL(url);
  }, [videoFile]);

  const showToast = (message, type = "success", duration = 3500) => {
    clearTimeout(toastTimerRef.current);
    setToast({ visible: true, message, type });
    toastTimerRef.current = setTimeout(
      () => setToast((s) => ({ ...s, visible: false })),
      duration
    );
  };

  useEffect(() => {
    return () => {
      clearTimeout(toastTimerRef.current);
    };
  }, []);

  const onFileChange = (e) => {
    if (isUploading) return;
    const file = e.target.files && e.target.files[0];
    if (!file) {
      setVideoFile(null);
      setFileError("");
      return;
    }
    if (!file.type.startsWith("video/")) {
      setFileError("Please select a valid video file.");
      return;
    }
    setFileError("");
    setVideoFile(file);
  };

  const onDrop = (e) => {
    if (isUploading) return;
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer?.files?.[0];
    if (!file) {
      return;
    }
    if (!file.type.startsWith("video/")) {
      setFileError("Please drop a valid video file.");
      return;
    }
    setFileError("");
    setVideoFile(file);
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const openFileDialog = () => fileInputRef.current?.click();

  const onSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("name", name);
    formData.append("description", description);
    formData.append("video", videoFile);

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const response = await axios.post(
        "http://localhost:3000/api/food/create",
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(percent);
            }
          },
        }
      );

      setUploadProgress(100);
      setIsUploading(false);
      showToast("Food uploaded successfully", "success");
      // reset form (optional)
      setName("");
      setDescription("");
      setVideoFile(null);
      setVideoURL("");
      console.log(response.data);
    } catch (err) {
      setIsUploading(false);
      showToast(err?.response?.data?.message || "Upload failed", "error");
      console.error(err);
    }
  };

  const isDisabled = useMemo(
    () => !name.trim() || !videoFile || isUploading,
    [name, videoFile, isUploading]
  );

  return (
    <>
      

      <div className="create-food-page">
        {/* Top navigation arrows */}
<div className="create-food-nav">
  <button
    className="nav-arrow"
    onClick={() => navigate(-1)}
    aria-label="Go back"
  >
    →
  </button>


</div>

        {/* Upload overlay */}
        {isUploading && (
          <div className="upload-overlay" role="status" aria-live="polite">
            <div className="upload-card" aria-hidden={false}>
              <div className="spinner" aria-hidden />
              <div className="upload-text">Uploading... {uploadProgress}%</div>
              <div className="progress-bar" aria-hidden>
                <div
                  className="progress-fill"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast.visible && (
        <div className={`toast ${toast.type}`} role="status" aria-live="polite">
          <span className="toast-message">{toast.message}</span>
          <button
            className="toast-close"
            onClick={() => setToast({ ...toast, visible: false })}
            aria-label="Close"
          >
            ×
          </button>
        </div>
      )}

        <div className="create-food-card">
          <header className="create-food-header">
            <h1 className="create-food-title">Create Food</h1>
            <p className="create-food-subtitle">
              Upload a short video, give it a name, and add a description.
            </p>
          </header>

          <form className="create-food-form" onSubmit={onSubmit}>
            <div className="field-group">
              <label htmlFor="foodVideo">Food Video</label>
              <input
                id="foodVideo"
                ref={fileInputRef}
                className="file-input-hidden"
                type="file"
                accept="video/*"
                disabled={isUploading}
                onChange={onFileChange}
              />

              <div
                className="file-dropzone"
                aria-disabled={isUploading}
                role="button"
                tabIndex={0}
                onClick={() => {
                  if (!isUploading) openFileDialog();
                }}
                onKeyDown={(e) => {
                  if (!isUploading && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    openFileDialog();
                  }
                }}
                onDrop={onDrop}
                onDragOver={onDragOver}
              >
                <div className="file-dropzone-inner">
                  <svg
                    className="file-icon"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M10.8 3.2a1 1 0 0 1 .4-.08h1.6a1 1 0 0 1 1 1v1.6h1.6a1 1 0 0 1 1 1v1.6h1.6a1 1 0 0 1 1 1v7.2a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6.4a1 1 0 0 1 1-1h1.6V3.2a1 1 0 0 1 1-1h1.6a1 1 0 0 1 .6.2z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M9 12.75v-1.5c0-.62.67-1 1.2-.68l4.24 2.45c.53.3.53 1.05 0 1.35L10.2 16.82c-.53.31-1.2-.06-1.2-.68v-1.5"
                      fill="currentColor"
                    />
                  </svg>
                  <div className="file-dropzone-text">
                    <strong>Tap to upload</strong> or drag and drop
                  </div>
                  <div className="file-hint">MP4, WebM, MOV • Up to ~100MB</div>
                </div>
              </div>

              {fileError && (
                <p className="error-text" role="alert">
                  {fileError}
                </p>
              )}

              {videoFile && (
                <div className="file-chip" aria-live="polite">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d="M9 12.75v-1.5c0-.62.67-1 1.2-.68l4.24 2.45c.53.3.53 1.05 0 1.35L10.2 16.82c-.53.31-1.2-.06-1.2-.68v-1.5" />
                  </svg>
                  <span className="file-chip-name">{videoFile.name}</span>
                  <span className="file-chip-size">
                    {(videoFile.size / 1024 / 1024).toFixed(1)} MB
                  </span>
                  <div className="file-chip-actions">
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => !isUploading && openFileDialog()}
                      disabled={isUploading}
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      className="btn-ghost danger"
                      onClick={() => {
                        if (!isUploading) {
                          setVideoFile(null);
                          setFileError("");
                        }
                      }}
                      disabled={isUploading}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>

            {videoURL && (
              <div className="video-preview">
                <video
                  className="video-preview-el"
                  src={videoURL}
                  controls
                  playsInline
                  preload="metadata"
                />
              </div>
            )}

            <div className="field-group">
              <label htmlFor="foodName">Name</label>
              <input
                id="foodName"
                type="text"
                placeholder="e.g., Spicy Paneer Wrap"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isUploading}
                required
              />
            </div>

            <div className="field-group">
              <label htmlFor="foodDesc">Description</label>
              <textarea
                id="foodDesc"
                rows={4}
                placeholder="Write a short description: ingredients, taste, spice level, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isUploading}
              />
            </div>

            <div className="form-actions">
              <button
                className="btn-primary"
                type="submit"
                disabled={isDisabled}
              >
                Save Food
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
export default CreateFood;
