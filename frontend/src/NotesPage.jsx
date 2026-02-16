import React, { useEffect, useMemo, useState } from "react";
import "./notespage.css";

function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [trash, setTrash] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [noteError, setNoteError] = useState("");
  const [loading, setLoading] = useState(true);

  // Helper for API calls
  const api = async (endpoint, method = "GET", body = null) => {
    const token = localStorage.getItem("user_token");
    if (!token) return null;
    try {
      const opts = {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      };
      if (body) opts.body = JSON.stringify(body);
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}${endpoint}`, opts);
      if (!res.ok) throw new Error("API Error");
      return method === "DELETE" ? true : await res.json();
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setLoading(true);
    const data = await api("/api/notes");
    if (data) {
      // Separate active vs trashed
      const active = data.filter(n => !n.trashed);
      const trashed = data.filter(n => n.trashed);
      setNotes(active.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
      setTrash(trashed.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
    }
    setLoading(false);
  };

  const handleNewNote = async () => {
    const newNote = {
      title: "Untitled Note",
      content: "",
      pinned: false,
      trashed: false
    };

    // Optimistic UI update or wait for server? Wait for server to get ID.
    const created = await api("/api/notes", "POST", newNote);
    if (created) {
      setNotes((prev) => [created, ...prev]);
      setActiveId(created.id);
      setActiveTab("all");
    }
  };

  const handleSelectNote = (id) => {
    setActiveId(id);
    setActiveTab("all");
  };

  const handleDeleteNote = async (id) => {
    // Move to trash (soft delete)
    const note = notes.find((n) => n.id === id);
    if (!note) return;

    const updated = await api(`/api/notes/${id}`, "PUT", { ...note, trashed: true });
    if (updated) {
      setNotes((prev) => prev.filter((n) => n.id !== id));
      setTrash((prev) => [updated, ...prev]);
      if (activeId === id) setActiveId(null);
    }
  };

  const restoreNote = async (id) => {
    const note = trash.find((n) => n.id === id);
    if (!note) return;

    const updated = await api(`/api/notes/${id}`, "PUT", { ...note, trashed: false });
    if (updated) {
      setTrash((prev) => prev.filter((n) => n.id !== id));
      setNotes((prev) => [updated, ...prev]);
      setActiveTab("all");
    }
  };

  const permanentDelete = async (id) => {
    const success = await api(`/api/notes/${id}`, "DELETE");
    if (success) {
      setTrash((prev) => prev.filter((n) => n.id !== id));
    }
  };

  const handleUpdateActive = (field, value) => {
    // Just update local state for responsiveness, debounce save could be added
    // For now, we will save on "Save" button click to reduce filtering API calls
    setNotes((prev) =>
      prev.map((n) =>
        n.id === activeId
          ? { ...n, [field]: value }
          : n
      )
    );
  };

  const handleSaveNote = async () => {
    const note = notes.find(n => n.id === activeId);
    if (!note) return;

    if (!note.title.trim() && !note.content.trim()) {
      setNoteError("Note is empty");
      return;
    }

    const updated = await api(`/api/notes/${note.id}`, "PUT", note);
    if (updated) {
      // Update list with server response (updated timestamps etc)
      setNotes(prev => prev.map(n => n.id === note.id ? updated : n));
      setNoteError("Saved!");
      setTimeout(() => setNoteError(""), 2000);
    } else {
      setNoteError("Failed to save");
    }
  };

  const handleTogglePin = async (id) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;

    const updated = await api(`/api/notes/${id}`, "PUT", { ...note, pinned: !note.pinned });
    if (updated) {
      setNotes((prev) =>
        prev.map((n) => n.id === id ? updated : n)
          .sort((a, b) => {
            // Re-sort
            if (updated.pinned && !b.pinned && b.id !== id) return -1; // New pin
            // ... sorting logic is complex with just one item change, 
            // simpler to just map then sort entire list
            return 0;
          })
          .sort((a, b) => { // Full sort
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return new Date(b.updatedAt) - new Date(a.updatedAt);
          })
      );
    }
  };

  const filteredNotes = useMemo(() => {
    const term = search.trim().toLowerCase();
    let list = notes;
    if (term) {
      list = notes.filter(
        (n) =>
          (n.title && n.title.toLowerCase().includes(term)) ||
          (n.content && n.content.toLowerCase().includes(term))
      );
    }
    return [...list].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
  }, [notes, search]);

  const activeNote = notes.find((n) => n.id === activeId) || null;

  if (loading) return <div className="loading">Loading Notes...</div>;

  return (
    <div className="notes-page">
      <header className="notes-header">
        <div>
          <h1 className="notes-title">Keep Notes</h1>
          <p className="notes-subtitle">
            Capture and organize your thoughts, tasks, and ideas.
          </p>
        </div>

        <div className="notes-header-actions">
          <div className="notes-search-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="notes-search-input"
              placeholder="Search notes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button className="notes-btn primary" onClick={handleNewNote}>
            + New Note
          </button>
        </div>
      </header>

      <div className="notes-tabs">
        <button
          className={`notes-tab ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          All Notes
        </button>

        <button
          className={`notes-tab ${activeTab === "deleted" ? "active" : ""}`}
          onClick={() => setActiveTab("deleted")}
        >
          Deleted Notes
        </button>
      </div>

      {activeTab === "deleted" ? (
        <div className="deleted-notes">
          {trash.length === 0 ? (
            <p className="notes-empty-title">No deleted notes.</p>
          ) : (
            trash.map((note) => (
              <div className="deleted-note-card" key={note.id}>
                <h3>{note.title}</h3>
                <p>{note.content || "No content"}</p>
                <p className="deleted-meta">
                  Deleted on: {note.deletedAt ? new Date(note.deletedAt).toLocaleString() : "Unknown"}
                </p>

                <div className="deleted-actions">
                  <button
                    className="notes-btn secondary"
                    onClick={() => restoreNote(note.id)}
                  >
                    Restore
                  </button>

                  <button
                    className="notes-btn danger"
                    onClick={() => permanentDelete(note.id)}
                  >
                    Permanently Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="notes-shell">
          <div className="notes-list-pane">
            <div className="notes-list-header">
              <h2>All Notes</h2>
              {filteredNotes.length > 0 && (
                <span className="notes-count">{filteredNotes.length}</span>
              )}
            </div>

            {filteredNotes.length === 0 ? (
              <div className="notes-empty">
                <p className="notes-empty-title">No notes yet</p>
                <p className="notes-empty-text">
                  Click <strong>“+ New Note”</strong> to create your first note.
                </p>
              </div>
            ) : (
              <div className="notes-list">
                {filteredNotes.map((note) => (
                  <button
                    key={note.id}
                    className={
                      "notes-list-item" +
                      (note.id === activeId ? " active" : "") +
                      (note.pinned ? " pinned" : "")
                    }
                    onClick={() => handleSelectNote(note.id)}
                  >
                    <div className="notes-list-main">
                      <div className="notes-list-title-row">
                        <span className="notes-list-title">{note.title || "Untitled"}</span>
                        {note.pinned && (
                          <span className="pin-indicator">📌</span>
                        )}
                      </div>
                      <p className="notes-list-snippet">
                        {note.content ? note.content : "No content yet"}
                      </p>
                    </div>
                    <div className="notes-list-meta">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="notes-editor-pane">
            {!activeNote ? (
              <div className="notes-editor-empty">
                <p>Select a note or create a new one.</p>
              </div>
            ) : (
              <div className="notes-editor-card">
                <div className="editor-header-row">
                  <input
                    className="editor-title-input"
                    value={activeNote.title}
                    onChange={(e) =>
                      handleUpdateActive("title", e.target.value)
                    }
                    placeholder="Note title"
                  />
                  <button
                    className={
                      "notes-btn subtle pin-btn " +
                      (activeNote.pinned ? "is-pinned" : "")
                    }
                    onClick={() => handleTogglePin(activeNote.id)}
                  >
                    {activeNote.pinned ? "📌 Pinned" : "📍 Pin"}
                  </button>
                </div>

                <textarea
                  className="editor-body-input"
                  value={activeNote.content}
                  onChange={(e) => handleUpdateActive("content", e.target.value)}
                  placeholder="Type your note here..."
                />

                {noteError && (
                  <div className="form-error">
                    {noteError}
                  </div>
                )}


                <div className="editor-footer-row">
                  <span className="editor-meta">
                    Last updated:{" "}
                    {new Date(activeNote.updatedAt).toLocaleString()}
                  </span>

                  <div className="editor-actions">
                    <button
                      className="notes-btn secondary"
                      type="button"
                      onClick={handleSaveNote}
                    >
                      Save
                    </button>


                    <button
                      className="notes-btn danger"
                      onClick={() => handleDeleteNote(activeNote.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotesPage;
