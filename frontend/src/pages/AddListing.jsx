import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

function AddListing() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleMediaChange = (e) => {
    setMediaFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("location", location);
      mediaFiles.forEach((file) => formData.append("media", file));

      await api.post("/api/listings", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/listings");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add listing");
    }
  };

  const previews = useMemo(() => {
    return mediaFiles.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type,
    }));
  }, [mediaFiles]);

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  return (
    <div className="add-listing page-shell page-shell--form">
      <div className="add-listing__header page-header">
        <div className="add-listing__header-content">
          <span className="add-listing__kicker page-kicker">Create</span>
          <h2 className="add-listing__title">Add Listing</h2>
          <p className="add-listing__subtitle page-subtitle">
            Build a polished product page with clear details, pricing, and media.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="add-listing__form listing-form">
        <div className="add-listing__form-group form-group">
          <label className="add-listing__label">Title</label>
          <input
            className="add-listing__input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="add-listing__form-group form-group">
          <label className="add-listing__label">Description</label>
          <textarea
            className="add-listing__textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="add-listing__form-group form-group">
          <label className="add-listing__label">Price</label>
          <input
            className="add-listing__input"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>

        <div className="add-listing__form-group form-group">
          <label className="add-listing__label">Category</label>
          <input
            className="add-listing__input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
        </div>

        <div className="add-listing__form-group form-group">
          <label className="add-listing__label">Location</label>
          <input
            className="add-listing__input"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>

        <div className="add-listing__form-group form-group">
          <label className="add-listing__label">Images / Videos</label>
          <input
            className="add-listing__file-input"
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleMediaChange}
          />
          <div className="add-listing__media-previews media-previews">
            {previews.map((preview, idx) => {
              if (preview.type.startsWith("image")) {
                return (
                  <img
                    key={idx}
                    src={preview.url}
                    alt="preview"
                    className="add-listing__media-thumb media-thumb"
                  />
                );
              } else if (preview.type.startsWith("video")) {
                return (
                  <video
                    key={idx}
                    src={preview.url}
                    className="add-listing__media-thumb media-thumb"
                    controls
                  />
                );
              }
              return null;
            })}
          </div>
        </div>

        {error && <div className="add-listing__form-error form-error">{error}</div>}

        <button type="submit" className="add-listing__submit-btn btn-primary">Add Listing</button>
      </form>
    </div>
  );
}

export default AddListing;
