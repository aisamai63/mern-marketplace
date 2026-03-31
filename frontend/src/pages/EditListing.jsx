import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { isVideoMedia, resolveMediaUrl } from "../utils/media";

function EditListing() {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [images, setImages] = useState([""]);
  const [status, setStatus] = useState("active");
  const [error, setError] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await axios.get(`/api/listings/${id}`);
        const listing = res.data.data;
        setTitle(listing.title);
        setDescription(listing.description);
        setPrice(listing.price);
        setCategory(listing.category || "");
        setLocation(listing.location || "");
        setStatus(listing.status || "active");
        setImages(
          listing.images && listing.images.length ? listing.images : [""],
        );
      } catch (err) {
        setError("Failed to load listing");
      }
    };
    fetchListing();
  }, [id]);

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
      formData.append("status", status);
      formData.append("userId", user?._id);
      mediaFiles.forEach((file) => formData.append("media", file));

      await axios.put(`/api/listings/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${user?.token}`,
        },
      });
      navigate("/");
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
    <div style={{ maxWidth: 400, margin: "2rem auto" }}>
      <h2>Edit Listing</h2>

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
          />
        </div>

        <div>
          <label>Location</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
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
            {/* Show already uploaded images/videos */}
            {images &&
              images.map((media, idx) => {
                if (!media || typeof media !== "string") {
                  return null;
                }

                const mediaUrl = resolveMediaUrl(media);

                if (isVideoMedia(media)) {
                  return (
                    <video
                      key={"old-" + idx}
                      src={mediaUrl}
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 4,
                        border: "1px solid #ccc",
                      }}
                      controls
                    />
                  );
                }

                return (
                  <img
                    key={"old-" + idx}
                    src={mediaUrl}
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
              })}
          </div>
        </div>

        <div>
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="active">Active</option>
            <option value="sold">Sold</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {error && <div style={{ color: "red" }}>{error}</div>}

        <button type="submit">Update</button>
      </form>
    </div>
  );
}

export default EditListing;
