import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { isVideoMedia, resolveMediaUrl } from "../utils/media";

function EditListing() {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [images, setImages] = useState([]);
  const [status, setStatus] = useState("active");
  const [error, setError] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await api.get(`/api/listings/${id}`);
        const listing = res.data.data;
        setTitle(listing.title);
        setDescription(listing.description);
        setPrice(listing.price);
        setCategory(listing.category || "");
        setLocation(listing.location || "");
        setStatus(listing.status || "active");
        setImages(
          listing.images && listing.images.length ? listing.images : [],
        );
      } catch (err) {
        setError("Failed to load listing");
      }
    };
    fetchListing();
  }, [id]);

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
      formData.append("status", status);
      mediaFiles.forEach((file) => formData.append("media", file));

      await api.put(`/api/listings/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/listings");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update listing");
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
    <div className="edit-listing page-shell page-shell--form">
      <div className="edit-listing__header page-header">
        <div className="edit-listing__header-content">
          <span className="edit-listing__kicker page-kicker">Update</span>
          <h2 className="edit-listing__title">Edit Listing</h2>
          <p className="edit-listing__subtitle page-subtitle">
            Refresh your listing details, status, and media so buyers always see the latest version.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="edit-listing__form listing-form">
        <div className="edit-listing__form-group form-group">
          <label className="edit-listing__label">Title</label>
          <input
            className="edit-listing__input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="edit-listing__form-group form-group">
          <label className="edit-listing__label">Description</label>
          <textarea
            className="edit-listing__textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="edit-listing__form-group form-group">
          <label className="edit-listing__label">Price</label>
          <input
            className="edit-listing__input"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>

        <div className="edit-listing__form-group form-group">
          <label className="edit-listing__label">Category</label>
          <input
            className="edit-listing__input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>

        <div className="edit-listing__form-group form-group">
          <label className="edit-listing__label">Location</label>
          <input
            className="edit-listing__input"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div className="edit-listing__form-group form-group">
          <label className="edit-listing__label">Status</label>
          <select className="edit-listing__select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="active">Active</option>
            <option value="sold">Sold</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="edit-listing__form-group form-group">
          <label className="edit-listing__label">Replace Images / Videos</label>
          <input
            className="edit-listing__file-input"
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleMediaChange}
          />
          <div className="edit-listing__media-previews media-previews">
            {/* New file previews */}
            {previews.map((preview, idx) => {
              if (preview.type.startsWith("image")) {
                return (
                  <img
                    key={`new-${idx}`}
                    src={preview.url}
                    alt="preview"
                    className="edit-listing__media-thumb media-thumb"
                  />
                );
              } else if (preview.type.startsWith("video")) {
                return (
                  <video
                    key={`new-${idx}`}
                    src={preview.url}
                    className="edit-listing__media-thumb media-thumb"
                    controls
                  />
                );
              }
              return null;
            })}
            {/* Existing media (shown only when no new files selected) */}
            {previews.length === 0 &&
              images.map((media, idx) => {
                if (!media || typeof media !== "string") return null;
                const mediaUrl = resolveMediaUrl(media);
                if (isVideoMedia(media)) {
                  return (
                    <video
                      key={`old-${idx}`}
                      src={mediaUrl}
                      className="edit-listing__media-thumb media-thumb"
                      controls
                    />
                  );
                }
                return (
                  <img
                    key={`old-${idx}`}
                    src={mediaUrl}
                    alt="existing"
                    className="edit-listing__media-thumb media-thumb"
                  />
                );
              })}
          </div>
        </div>

        {error && <div className="edit-listing__form-error form-error">{error}</div>}

        <button type="submit" className="edit-listing__submit-btn btn-primary">Update Listing</button>
      </form>
    </div>
  );
}

export default EditListing;
