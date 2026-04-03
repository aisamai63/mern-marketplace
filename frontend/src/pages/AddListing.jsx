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
    <div className="form-page">
      <h2>Add Listing</h2>

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
            required
          />
        </div>

        <div className="form-group">
          <label>Location</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Images / Videos</label>
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleMediaChange}
          />
          <div className="media-previews">
            {previews.map((preview, idx) => {
              if (preview.type.startsWith("image")) {
                return (
                  <img
                    key={idx}
                    src={preview.url}
                    alt="preview"
                    className="media-thumb"
                  />
                );
              } else if (preview.type.startsWith("video")) {
                return (
                  <video
                    key={idx}
                    src={preview.url}
                    className="media-thumb"
                    controls
                  />
                );
              }
              return null;
            })}
          </div>
        </div>

        {error && <div className="form-error">{error}</div>}

        <button type="submit" className="btn-primary">Add Listing</button>
      </form>
    </div>
  );
}

export default AddListing;
