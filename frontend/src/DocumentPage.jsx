// DocumentPage.jsx
import React, { useState, useEffect } from "react";
import "./documentpage.css";

function DocumentPage() {
  const [activeTab, setActiveTab] = useState("my"); // "my" | "upload" | "trash"
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  // upload form state
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDocs();
  }, []);

  const api = async (endpoint, method = "GET", body = null, isJson = true) => {
    const token = localStorage.getItem("user_token");
    if (!token) return null;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      if (isJson) headers["Content-Type"] = "application/json";

      const opts = { method, headers };
      if (body) opts.body = isJson ? JSON.stringify(body) : body;

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}${endpoint}`, opts);
      if (!res.ok) throw new Error("API Error");
      return method === "DELETE" ? true : await res.json();
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const fetchDocs = async () => {
    setLoading(true);
    const data = await api("/api/documents");
    if (data) {
      setDocs(data);
    }
    setLoading(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError("");
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected || null);
  };

  const handleAddDocument = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Please enter a document title.");
      return;
    }
    if (!file) {
      setError("Please choose a file to upload.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("note", note);
    formData.append("file", file);

    // Custom fetch here for FormData
    try {
      const token = localStorage.getItem("user_token");
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/documents/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }, // No Content-Type for FormData
        body: formData
      });

      if (res.ok) {
        const newDoc = await res.json();
        setDocs((prev) => [newDoc, ...prev]);
        setTitle("");
        setNote("");
        setFile(null);
        setError("");
        setActiveTab("my");
        if (e.target.reset) e.target.reset(); // clear file input visually
      } else {
        setError("Failed to upload document");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setUploading(false);
    }
  };

  // Trash: update isTrashed=true
  const handleDelete = async (id) => {
    const doc = docs.find(d => d.id === id);
    if (!doc) return;

    // The backend expects the Updated Document object in the body for PUT /api/documents/{id}
    // We must ensure isTrashed is set to true in the object we send.
    const updatedDoc = { ...doc, isTrashed: true };

    const result = await api(`/api/documents/${id}`, "PUT", updatedDoc);

    if (result) {
      setDocs(prev => prev.map(d => d.id === id ? result : d));
    } else {
      alert("Failed to move to trash");
    }
  };

  // Restore: update isTrashed=false
  const handleRestore = async (id) => {
    const doc = docs.find(d => d.id === id);
    if (!doc) return;

    const updatedDoc = { ...doc, isTrashed: false };
    const result = await api(`/api/documents/${id}`, "PUT", updatedDoc);

    if (result) {
      setDocs(prev => prev.map(d => d.id === id ? result : d));
    }
  };

  // Delete forever
  const handleDeleteForever = async (id) => {
    const success = await api(`/api/documents/${id}`, "DELETE");
    if (success) {
      setDocs(prev => prev.filter(d => d.id !== id));
    }
  };

  const handleDownload = async (doc) => {
    try {
      const token = localStorage.getItem("user_token");
      // Fetch as blob
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/documents/${doc.id}/file`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.fileName; // Use filename from doc object
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert("Failed to download file");
      }
    } catch (e) {
      console.error(e);
      alert("Error downloading file");
    }
  };

  const handleView = async (doc) => {
    try {
      const token = localStorage.getItem("user_token");
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/documents/${doc.id}/file`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      
      } else {
        alert("Failed to view file");
      }
    } catch (e) {
      console.error(e);
      alert("Error viewing file");
    }
  };

  if (loading) return <div className="loading">Loading Documents...</div>;

  return (
    <div className="document-page">
      <header className="doc-header">
        <div>
          <h1 className="doc-title">Document Vault</h1>
          <p className="doc-subtitle">
            Store and manage all your important files in one place.
          </p>
        </div>
      </header>

      <div className="doc-shell">
        {/* Tabs */}
        <div className="doc-tabs">
          <button
            className={`doc-tab ${activeTab === "my" ? "active" : ""}`}
            onClick={() => handleTabChange("my")}
          >
            My Documents
          </button>
          <button
            className={`doc-tab ${activeTab === "upload" ? "active" : ""}`}
            onClick={() => handleTabChange("upload")}
          >
            Upload Document
          </button>
          <button
            className={`doc-tab ${activeTab === "trash" ? "active" : ""}`}
            onClick={() => handleTabChange("trash")}
          >
            Trash
          </button>
        </div>

        {/* Content Area */}
        <div className="doc-content">
          {activeTab === "my" && (
            <MyDocuments
              docs={docs.filter((d) => !d.isTrashed)}
              onDelete={handleDelete}
              onDownload={handleDownload}
              onView={handleView}
            />
          )}

          {activeTab === "upload" && (
            <div className="upload-layout">
              <UploadDocument
                onSubmit={handleAddDocument}
                onFileChange={handleFileChange}
                title={title}
                setTitle={setTitle}
                note={note}
                setNote={setNote}
                error={error}
                uploading={uploading}
              />
            </div>
          )}

          {activeTab === "trash" && (
            <TrashDocuments
              docs={docs.filter((d) => d.isTrashed)}
              onRestore={handleRestore}
              onDeleteForever={handleDeleteForever}
            />
          )}
        </div>
      </div>
    </div>
  );
}


function MyDocuments({ docs, onDelete, onDownload, onView }) {
  if (!docs.length) {
    return (
      <div className="doc-empty">
        <p className="doc-empty-title">No documents yet</p>
        <p className="doc-empty-text">
          Use the <strong>Upload Document</strong> section to add your first file.
        </p>
      </div>
    );
  }

  return (
    <div className="doc-grid">
      {docs.map((doc) => (
        <div className="doc-card" key={doc.id}>
          <div className="doc-card-header">
            <div className="doc-avatar">📄</div>
            <div>
              <h3 className="doc-card-title">{doc.title}</h3>
              <p className="doc-card-meta">{doc.fileName}</p>
            </div>
          </div>

          {doc.note && <p className="doc-card-note">{doc.note}</p>}

          <p className="doc-card-date">Added on: {new Date(doc.createdAt).toLocaleDateString()}</p>

          <div className="doc-card-actions">
            <button
              onClick={() => onView(doc)}
              className="doc-btn primary"
              title="View Document"
            >
              View
            </button>
            <button
              onClick={() => onDownload(doc)}
              className="doc-btn secondary"
            >
              Download
            </button>
            <button
              className="doc-btn danger"
              onClick={() => onDelete(doc.id)}
            >
              Move to Trash
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}



function UploadDocument({
  onSubmit,
  onFileChange,
  title,
  setTitle,
  note,
  setNote,
  error,
  uploading
}) {
  return (
    <form className="upload-form" onSubmit={onSubmit}>
      <div className="form-row">
        <label className="form-label">Document Title</label>
        <input
          type="text"
          className="form-input"
          placeholder="e.g. Aadhar / Degree / Offer Letter"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="form-row">
        <label className="form-label">Note (Optional)</label>
        <input
          type="text"
          className="form-input"
          placeholder="Description"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <div className="form-row">
        <label className="form-label">Upload File</label>
        <label className="file-input-label">
          <span>Choose file</span>
          <input type="file" accept=".pdf,image/*" onChange={onFileChange} />
        </label>
        <p className="file-hint">Supported: PDF, JPG, PNG</p>
      </div>

      {error && <div className="form-error">{error}</div>}

      <button type="submit" className="doc-btn primary" disabled={uploading}>
        {uploading ? "Uploading..." : "Save Document"}
      </button>
    </form>
  );
}

function TrashDocuments({ docs, onRestore, onDeleteForever }) {
  if (!docs.length) {
    return (
      <div className="doc-empty">
        <p className="doc-empty-title">Trash is Empty</p>
      </div>
    );
  }

  return (
    <div className="doc-grid">
      {docs.map((doc) => (
        <div className="doc-card" key={doc.id}>
          <div className="doc-card-header">
            <div className="doc-avatar">🗑️</div>
            <div>
              <h3 className="doc-card-title">{doc.title}</h3>
              <p className="doc-card-meta">{doc.fileName}</p>
            </div>
          </div>

          <p className="doc-card-date">Deleted on: {new Date(doc.createdAt).toLocaleDateString()}</p>

          <div className="doc-card-actions">
            <button className="doc-btn secondary" onClick={() => onRestore(doc.id)}>
              Restore
            </button>
            <button
              className="doc-btn danger"
              onClick={() => onDeleteForever(doc.id)}
            >
              Delete Forever
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default DocumentPage;
