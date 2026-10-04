import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Heart,
  Plus,
  Save,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import PageTitle from "../Components/PageTitle";

const API_URL = "http://localhost:8180";

const AdminCharityForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const editing = Boolean(id);

  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [coverUploading, setCoverUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    location: "",
    image: "",
    images: [],
    website: "",
    featured: false,
    active: true,
    events: [],
  });

  const getToken = () => localStorage.getItem("token");

  const getImageUrl = (image) => {
    if (!image) return "";

    // Old/external image URL
    if (/^https?:\/\//i.test(image)) {
      return image;
    }

    // New locally uploaded image
    return `${API_URL}${image}`;
  };

  // =====================================================
  // FETCH CHARITY FOR EDIT
  // =====================================================

  useEffect(() => {
    if (!editing) return;

    const fetchCharity = async () => {
      try {
        setLoading(true);
        setError("");

        const token = getToken();

        if (!token) {
          navigate("/login", { replace: true });
          return;
        }

        const response = await fetch(`${API_URL}/api/charities/admin/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          localStorage.removeItem("user");

          navigate("/login", { replace: true });
          return;
        }

        if (!response.ok) {
          throw new Error(data.message || "Unable to load charity.");
        }

        const charity = data.charity;

        setForm({
          name: charity.name || "",
          description: charity.description || "",
          category: charity.category || "",
          location: charity.location || "",
          image: charity.image || "",
          images: Array.isArray(charity.images) ? charity.images : [],
          website: charity.website || "",
          featured: Boolean(charity.featured),
          active: charity.active !== false,

          events: (charity.events || []).map((event) => ({
            title: event.title || "",
            description: event.description || "",
            date: event.date
              ? new Date(event.date).toISOString().split("T")[0]
              : "",
          })),
        });
      } catch (err) {
        console.error("Fetch Charity Error:", err);
        setError(err.message || "Unable to load charity.");
      } finally {
        setLoading(false);
      }
    };

    fetchCharity();
  }, [editing, id, navigate]);

  // =====================================================
  // IMAGE GALLERY HANDLERS
  // =====================================================

  // =====================================================
  // IMAGE UPLOAD HANDLERS
  // =====================================================

  const uploadImages = async (files) => {
    const token = getToken();

    if (!token) {
      navigate("/login", { replace: true });
      return [];
    }

    const uploadData = new FormData();

    files.forEach((file) => {
      uploadData.append("images", file);
    });

    const response = await fetch(`${API_URL}/api/charities/upload-images`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: uploadData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to upload image.");
    }

    return data.images || [];
  };

  const handleCoverImageUpload = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      setCoverUploading(true);
      setError("");

      const images = await uploadImages([file]);

      if (images.length > 0) {
        setForm((prev) => ({
          ...prev,
          image: images[0],
        }));
      }
    } catch (err) {
      console.error("Cover Image Upload Error:", err);

      setError(err.message || "Unable to upload cover image.");
    } finally {
      setCoverUploading(false);
      e.target.value = "";
    }
  };

  const handleGalleryImagesUpload = async (e) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    try {
      setGalleryUploading(true);
      setError("");

      const images = await uploadImages(files);

      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...images],
      }));
    } catch (err) {
      console.error("Gallery Upload Error:", err);

      setError(err.message || "Unable to upload gallery images.");
    } finally {
      setGalleryUploading(false);
      e.target.value = "";
    }
  };

  const removeCoverImage = () => {
    setForm((prev) => ({
      ...prev,
      image: "",
    }));
  };

  const removeImage = (index) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, imageIndex) => imageIndex !== index),
    }));
  };

  // =====================================================
  // EVENT HANDLERS
  // =====================================================

  const addCharityEvent = () => {
    setForm((prev) => ({
      ...prev,
      events: [
        ...prev.events,
        {
          title: "",
          description: "",
          date: "",
        },
      ],
    }));
  };

  const updateCharityEvent = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      events: prev.events.map((event, eventIndex) =>
        eventIndex === index
          ? {
              ...event,
              [field]: value,
            }
          : event,
      ),
    }));
  };

  const removeCharityEvent = (index) => {
    setForm((prev) => ({
      ...prev,
      events: prev.events.filter((_, eventIndex) => eventIndex !== index),
    }));
  };

  // =====================================================
  // SAVE
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const token = getToken();

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      const payload = {
        ...form,

        images: Array.isArray(form.images)
          ? form.images.map((image) => image.trim()).filter(Boolean)
          : [],

        events: Array.isArray(form.events)
          ? form.events.map((event) => ({
              title: event.title.trim(),
              description: event.description?.trim() || "",
              date: event.date,
            }))
          : [],
      };

      const response = await fetch(
        editing ? `${API_URL}/api/charities/${id}` : `${API_URL}/api/charities`,
        {
          method: editing ? "PUT" : "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("user");

        navigate("/login", { replace: true });
        return;
      }

      if (response.status === 403) {
        throw new Error(data.message || "Admin permission required.");
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to save charity.");
      }

      alert(
        editing
          ? "Charity updated successfully."
          : "Charity added successfully.",
      );

      navigate("/admin", {
        replace: true,
        state: {
          section: "charities",
        },
      });
    } catch (err) {
      console.error("Save Charity Error:", err);

      setError(err.message || "Unable to save charity.");
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // BACK TO ADMIN
  // =====================================================

  const backToAdmin = () => {
    navigate("/admin", {
      state: {
        section: "charities",
      },
    });
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09111B]">
        <div className="text-center">
          <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-[#482ECE] border-t-transparent" />

          <p className="mt-4 text-sm text-gray-500">Loading charity...</p>
        </div>
      </div>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <>
      <PageTitle title="Charity-Form" />
      <div className="min-h-screen bg-[#09111B] text-white">
        {/* HEADER */}

        <header className="border-b border-gray-800 bg-[#0B121C]">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
            <button
              type="button"
              onClick={backToAdmin}
              className="flex items-center gap-2 text-sm font-semibold text-gray-400 transition hover:text-white"
            >
              <ArrowLeft size={18} />
              Back to Admin
            </button>

            <div className="flex items-center gap-2 text-xs text-[#A99FFF]">
              <Heart size={16} />
              Charity Management
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          {/* PAGE TITLE */}

          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">
              {editing ? "Edit Charity" : "Add Charity"}
            </h1>

            <p className="mt-2 text-sm text-gray-400">
              {editing
                ? "Update charity information, media, status and upcoming events."
                : "Create a charity profile, add media and upcoming events."}
            </p>
          </div>

          {/* ERROR */}

          {error && (
            <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-7 space-y-6">
            {/* =================================================
              BASIC INFORMATION
          ================================================= */}

            <section className="rounded-2xl border border-gray-800 bg-[#0D1520] p-5 sm:p-6">
              <h2 className="text-lg font-bold">Basic Information</h2>

              <p className="mt-1 text-sm text-gray-500">
                Main information displayed on the charity profile.
              </p>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <Field
                  label="Name"
                  required
                  value={form.name}
                  onChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      name: value,
                    }))
                  }
                />

                <Field
                  label="Category"
                  required
                  value={form.category}
                  onChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      category: value,
                    }))
                  }
                />

                <Field
                  label="Location"
                  value={form.location}
                  onChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      location: value,
                    }))
                  }
                />

                <Field
                  label="Website"
                  type="url"
                  value={form.website}
                  onChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      website: value,
                    }))
                  }
                />
              </div>
            </section>

            {/* =================================================
              PROFILE CONTENT
          ================================================= */}

            <section className="rounded-2xl border border-gray-800 bg-[#0D1520] p-5 sm:p-6">
              <h2 className="text-lg font-bold">Profile Content</h2>

              <p className="mt-1 text-sm text-gray-500">
                Add the main cover image and charity description.
              </p>

              {/* COVER IMAGE */}
              <div className="mt-6">
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Cover Image
                </label>

                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  onChange={handleCoverImageUpload}
                  disabled={coverUploading}
                  className="block w-full rounded-xl border border-gray-700 bg-[#09111B] px-4 py-3 text-sm text-gray-300 file:mr-4 file:rounded-lg file:border-0 file:bg-[#482ECE] file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-[#5B42E8] disabled:opacity-50"
                />

                <p className="mt-2 text-xs text-gray-500">
                  JPG, JPEG, PNG or WEBP. Maximum 5 MB.
                </p>

                {coverUploading && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-[#A99FFF]">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#A99FFF] border-t-transparent" />
                    Uploading cover image...
                  </div>
                )}

                {form.image && (
                  <div className="mt-5">
                    <div className="relative h-90 w-full max-w-160 overflow-hidden rounded-2xl border border-gray-800 bg-[#09111B]">
                      <img
                        src={getImageUrl(form.image)}
                        alt="Charity cover"
                        className="h-full w-full object-contain"
                      />

                      <button
                        type="button"
                        onClick={removeCoverImage}
                        className="absolute right-3 top-3 rounded-lg bg-red-500/90 p-2 text-white transition hover:bg-red-500"
                        title="Remove cover image"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>

                    <p className="mt-2 text-xs text-gray-500">
                      Preview: 640 × 360
                    </p>
                  </div>
                )}
              </div>
              {/* DESCRIPTION */}

              <div className="mt-5">
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Description
                </label>

                <textarea
                  rows="6"
                  required
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Write a description about this charity..."
                  className="w-full resize-none rounded-xl border border-gray-700 bg-[#09111B] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-[#482ECE] focus:ring-1 focus:ring-[#482ECE]/30"
                />
              </div>
            </section>

            {/* =================================================
    CHARITY GALLERY
================================================= */}

            <section className="rounded-2xl border border-gray-800 bg-[#0D1520] p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <ImageIcon size={20} className="text-[#A99FFF]" />

                    <h2 className="text-lg font-bold">Charity Gallery</h2>
                  </div>

                  <p className="mt-2 text-sm text-gray-500">
                    Select multiple images from your computer.
                  </p>
                </div>

                <label
                  className={`flex cursor-pointer items-center gap-2 rounded-xl border border-[#482ECE]/30 bg-[#482ECE]/10 px-4 py-2.5 text-sm font-semibold text-[#A99FFF] transition hover:bg-[#482ECE]/20 ${
                    galleryUploading ? "pointer-events-none opacity-50" : ""
                  }`}
                >
                  <Plus size={17} />

                  {galleryUploading ? "Uploading..." : "Choose Images"}

                  <input
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    onChange={handleGalleryImagesUpload}
                    disabled={galleryUploading}
                    className="hidden"
                  />
                </label>
              </div>

              <p className="mt-3 text-xs text-gray-500">
                JPG, JPEG, PNG or WEBP. Maximum 5 MB per image.
              </p>

              {galleryUploading && (
                <div className="mt-5 flex items-center gap-2 text-sm text-[#A99FFF]">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#A99FFF] border-t-transparent" />
                  Uploading gallery images...
                </div>
              )}

              {form.images.length === 0 && !galleryUploading ? (
                <div className="mt-6 rounded-xl border border-dashed border-gray-700 p-8 text-center">
                  <ImageIcon size={30} className="mx-auto text-gray-600" />

                  <p className="mt-3 text-sm text-gray-500">
                    No gallery images added.
                  </p>
                </div>
              ) : (
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {form.images.map((image, index) => (
                    <div
                      key={`${image}-${index}`}
                      className="overflow-hidden rounded-2xl border border-gray-800 bg-[#09111B]"
                    >
                      {/* 16:9 Gallery Preview */}
                      <div className="relative aspect-video w-full bg-[#09111B]">
                        <img
                          src={getImageUrl(image)}
                          alt={`Gallery ${index + 1}`}
                          className="h-full w-full object-contain"
                        />

                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute right-2 top-2 rounded-lg bg-red-500/90 p-2 text-white transition hover:bg-red-500"
                          title="Remove image"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="border-t border-gray-800 px-4 py-3">
                        <p className="text-xs text-gray-500">
                          Gallery Image {index + 1}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* =================================================
              UPCOMING EVENTS
          ================================================= */}

            <section className="rounded-2xl border border-gray-800 bg-[#0D1520] p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <CalendarDays size={20} className="text-[#A99FFF]" />

                    <h2 className="text-lg font-bold">Upcoming Events</h2>
                  </div>

                  <p className="mt-2 text-sm text-gray-500">
                    Events will appear on the public charity profile.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addCharityEvent}
                  className="flex items-center gap-2 rounded-xl border border-[#482ECE]/30 bg-[#482ECE]/10 px-4 py-2.5 text-sm font-semibold text-[#A99FFF] transition hover:bg-[#482ECE]/20"
                >
                  <Plus size={17} />
                  Add Event
                </button>
              </div>

              {form.events.length === 0 ? (
                <div className="mt-6 rounded-xl border border-dashed border-gray-700 p-8 text-center">
                  <CalendarDays size={30} className="mx-auto text-gray-600" />

                  <p className="mt-3 text-sm text-gray-500">
                    No upcoming events added.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-5">
                  {form.events.map((event, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-gray-800 bg-[#09111B]/70 p-5"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-[#A99FFF]">
                          Event {index + 1}
                        </p>

                        <button
                          type="button"
                          onClick={() => removeCharityEvent(index)}
                          className="rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-400 transition hover:bg-red-500/20"
                          title="Remove event"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <Field
                          label="Event Title"
                          required
                          value={event.title}
                          onChange={(value) =>
                            updateCharityEvent(index, "title", value)
                          }
                        />

                        <Field
                          label="Event Date"
                          type="date"
                          required
                          value={event.date}
                          onChange={(value) =>
                            updateCharityEvent(index, "date", value)
                          }
                        />

                        <div className="md:col-span-2">
                          <label className="mb-2 block text-sm text-gray-300">
                            Event Description
                          </label>

                          <textarea
                            rows="3"
                            value={event.description}
                            onChange={(e) =>
                              updateCharityEvent(
                                index,
                                "description",
                                e.target.value,
                              )
                            }
                            placeholder="Short description about this event..."
                            className="w-full resize-none rounded-xl border border-gray-700 bg-[#09111B] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-[#482ECE]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* =================================================
              SETTINGS
          ================================================= */}

            <section className="rounded-2xl border border-gray-800 bg-[#0D1520] p-5 sm:p-6">
              <h2 className="text-lg font-bold">Settings</h2>

              <div className="mt-5 flex flex-wrap gap-6">
                <CheckField
                  label="Featured Charity"
                  checked={form.featured}
                  onChange={(checked) =>
                    setForm((prev) => ({
                      ...prev,
                      featured: checked,
                    }))
                  }
                />

                <CheckField
                  label="Active"
                  checked={form.active}
                  onChange={(checked) =>
                    setForm((prev) => ({
                      ...prev,
                      active: checked,
                    }))
                  }
                />
              </div>
            </section>

            {/* =================================================
              ACTIONS
          ================================================= */}

            <div className="flex flex-col-reverse gap-3 border-t border-gray-800 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={saving}
                onClick={backToAdmin}
                className="rounded-xl border border-gray-700 px-6 py-3 font-semibold text-gray-300 transition hover:bg-white/5 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex min-w-[180px] items-center justify-center gap-2 rounded-xl bg-[#482ECE] px-6 py-3 font-semibold text-white transition hover:bg-[#5B42E8] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    {editing ? "Update Charity" : "Add Charity"}
                  </>
                )}
              </button>
            </div>
          </form>
        </main>
      </div>
    </>
  );
};

// =====================================================
// FIELD
// =====================================================

const Field = ({ label, value, onChange, type = "text", required = false }) => (
  <div>
    <label className="mb-2 block text-sm font-medium text-gray-300">
      {label}
    </label>

    <input
      type={type}
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-gray-700 bg-[#09111B] px-4 py-3 text-sm text-white outline-none transition focus:border-[#482ECE] focus:ring-1 focus:ring-[#482ECE]/30"
    />
  </div>
);

// =====================================================
// CHECKBOX
// =====================================================

const CheckField = ({ label, checked, onChange }) => (
  <label className="flex cursor-pointer items-center gap-3 text-sm text-gray-300">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="h-4 w-4 accent-[#482ECE]"
    />

    {label}
  </label>
);

export default AdminCharityForm;
