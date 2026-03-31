import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function AddListing() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [images, setImages] = useState([""]);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleImageChange = (idx, value) => {
    const newImages = [...images];
    newImages[idx] = value;
    setImages(newImages);
  };

  const addImageField = () => setImages([...images, ""]);

  const removeImageField = (idx) =>
    setImages(images.filter((_, i) => i !== idx));

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
      formData.append("userId", user?._id);
      mediaFiles.forEach((file) => formData.append("media", file));

      await axios.post("/api/listings", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${user?.token}`,
        },
      });
      navigate("/");
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
    <div style={{ maxWidth: 400, margin: "2rem auto" }}>
      <h2>Add Listing</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Price</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Category</label>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Location</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Images / Videos</label>
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleMediaChange}
          />
          <div
            style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}
          >
            {previews.map((preview, idx) => {
              if (preview.type.startsWith("image")) {
                return (
                  <img
                    key={idx}
                    src={preview.url}
                    alt="preview"
                    style={{
                      width: 60,
                      height: 60,
                      objectFit: "cover",
                      borderRadius: 4,
                      border: "1px solid #ccc",
                    }}
                  />
                );
              } else if (preview.type.startsWith("video")) {
                return (
                  <video
                    key={idx}
                    src={preview.url}
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 4,
                      border: "1px solid #ccc",
                    }}
                    controls
                  />
                );
              } else {
                return null;
              }
            })}
          </div>
        </div>

        {error && <div style={{ color: "red" }}>{error}</div>}

        <button type="submit">Add</button>
      </form>
    </div>
  );
}

export default AddListing;
