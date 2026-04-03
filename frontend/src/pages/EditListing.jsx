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
    <div className="form-page">
      <h2>Edit Listing</h2>

      <form onSubmit={handleSubmit} className="listing-form">
        <div className="form-group">
          <label>Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Price</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Category</label>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Location</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="active">Active</option>
            <option value="sold">Sold</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="form-group">
          <label>Replace Images / Videos</label>
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleMediaChange}
          />
          <div className="media-previews">
            {/* New file previews */}
            {previews.map((preview, idx) => {
              if (preview.type.startsWith("image")) {
                return (
                  <img
                    key={`new-${idx}`}
                    src={preview.url}
                    alt="preview"
                    className="media-thumb"
                  />
                );
              } else if (preview.type.startsWith("video")) {
                return (
                  <video
                    key={`new-${idx}`}
                    src={preview.url}
                    className="media-thumb"
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
                      className="media-thumb"
                      controls
                    />
                  );
                }
                return (
                  <img
                    key={`old-${idx}`}
                    src={mediaUrl}
                    alt="existing"
                    className="media-thumb"
                  />
                );
              })}
          </div>
        </div>

        {error && <div className="form-error">{error}</div>}

        <button type="submit" className="btn-primary">Update Listing</button>
      </form>
    </div>
  );
}

export default EditListing;
