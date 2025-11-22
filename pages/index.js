import { useEffect, useState } from "react";

export default function Home() {
  const [links, setLinks] = useState([]);
  const [url, setUrl] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [deleteCode, setDeleteCode] = useState("");

  async function fetchLinks() {
    const res = await fetch("/api/links");
    setLinks(await res.json());
  }

  useEffect(() => {
    fetchLinks();

    if (localStorage.getItem("theme") === "light") {
      document.body.classList.remove("dark");
      document.body.classList.add("light");
    }

    const closeOnEsc = (e) => {
      if (e.key === "Escape") setShowModal(false);
    };
    document.addEventListener("keydown", closeOnEsc);
    return () => document.removeEventListener("keydown", closeOnEsc);
  }, []);

  async function createLink(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, code }),
    });

    const data = await res.json();

    if (res.status !== 201) {
      setError(data.error);
      return;
    }

    setUrl("");
    setCode("");
    setSuccess(`Short link created — Code: ${data.code}`);
    fetchLinks();
  }

  function showDelete(code) {
    setDeleteCode(code);
    setShowModal(true);
  }

  async function confirmDelete() {
    await fetch(`/api/links/${deleteCode}`, { method: "DELETE" });
    setShowModal(false);
    setDeleteCode("");
    fetchLinks();
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
  }

  function toggleTheme() {
    if (document.body.classList.contains("dark")) {
      document.body.classList.remove("dark");
      document.body.classList.add("light");
      localStorage.setItem("theme", "light");
    } else {
      document.body.classList.remove("light");
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  }

  return (
    <div className="container">

      <button className="theme-toggle" onClick={toggleTheme}>🌓 Theme</button>

      <h1 className="title">TinyLink – URL Shortener</h1>

      <div className="card">
        <form onSubmit={createLink} className="form">
          <input
            type="text"
            placeholder="Enter Long URL"
            className="input"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          <input
            type="text"
            placeholder="Custom Code (Optional)"
            className="input"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />

          <button className="button">Create Short Link</button>

          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}
        </form>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Short URL</th>
              <th>Code</th>
              <th>URL</th>
              <th>Clicks</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {links.map((l) => {
              const shortUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/${l.code}`;
              return (
                <tr key={l.code}>
                  <td className="shorturl">
                    <a href={shortUrl} target="_blank">{shortUrl}</a>
                  </td>

                  <td className="code">{l.code}</td>

                  <td className="url">
                    <a href={l.url} target="_blank">{l.url}</a>
                  </td>

                  <td className="center">{l.clicks}</td>

                  <td className="actions">
                    <button
                      className="copy-btn"
                      onClick={() => copyToClipboard(shortUrl)}
                    >
                      Copy
                    </button>

                    <a className="stats-btn" href={`/code/${l.code}`}>Stats</a>

                    <button className="delete-btn" onClick={() => showDelete(l.code)}>
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}

            {links.length === 0 && (
              <tr>
                <td colSpan="5" className="empty">No links created yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Delete Link?</h2>
            <p className="modal-text">
              Are you sure you want to delete <b>{deleteCode}</b>?
            </p>

            <div className="modal-buttons">
              <button className="modal-cancel" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="modal-delete" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
body {
  margin: 0;
  padding: 0;
  transition: 0.4s;
}

body.dark {
  background: #0a0a0a;
  color: white;
}
body.light {
  background: #f0f0f0;
  color: black;
}

body.dark::before, body.light::before {
  content: "";
  position: fixed;
  inset: 0;
  background: linear-gradient(120deg,#3b82f6,#a855f7,#ec4899);
  filter: blur(140px);
  animation: bgMove 10s infinite alternate;
  opacity: 0.17;
  z-index: -1;
}
@keyframes bgMove {
  0% { transform: translateX(-20%); }
  100% { transform: translateX(20%); }
}

.container {
  max-width: 900px;
  margin: auto;
  padding: 30px;
}

.theme-toggle {
  background: #444;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 8px;
  cursor: pointer;
  float: right;
}
.theme-toggle:hover { opacity: 0.8; }

.title {
  text-align: center;
  font-size: 34px;
  font-weight: bold;
  margin-bottom: 30px;
  background: linear-gradient(to right,#a855f7,#3b82f6);
  -webkit-background-clip: text;
  color: transparent;
}

.card {
  background: rgba(255,255,255,0.10);
  padding: 25px;
  border-radius: 12px;
  margin-bottom: 30px;
  border: 1px solid rgba(255,255,255,0.2);
  box-shadow: 0 0 25px rgba(0,0,0,0.4);
}

.form { display: grid; gap: 15px; }

.input {
  padding: 12px;
  border-radius: 6px;
  border: none;
  font-size: 15px;
}

.button {
  padding: 12px;
  background: linear-gradient(to right,#7c3aed,#2563eb);
  border: none;
  border-radius: 8px;
  font-size: 16px;
  color: white;
  cursor: pointer;
}
.button:hover { opacity: 0.8; }

.error { color: #ff5959; }
.success { color: #4ade80; }

.table-wrapper {
  background: rgba(255,255,255,0.08);
  border-radius: 12px;
  padding: 15px;
  border: 1px solid rgba(255,255,255,0.15);
}

.table { width: 100%; border-collapse: collapse; }

th {
  padding: 12px;
  background: rgba(255,255,255,0.1);
}

td {
  padding: 12px;
  border-top: 1px solid rgba(255,255,255,0.15);
}

.shorturl {
  max-width: 200px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.shorturl a {
  color: #60a5fa;
  text-decoration: none;
}
.shorturl a:hover { text-decoration: underline; }

.code {
  font-weight: bold;
  color: #c084fc;
}

.url {
  max-width: 260px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.center { text-align: center; }

.actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.copy-btn,
.stats-btn,
.delete-btn {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  border: none;
  text-decoration: none;
}

.copy-btn {
  background: #2563eb;
  color: white;
}

.stats-btn {
  background: #facc15;
  color: black;
}

.delete-btn {
  background: #dc2626;
  color: white;
}

.copy-btn:hover,
.stats-btn:hover,
.delete-btn:hover {
  opacity: 0.8;
}

.empty {
  color: grey;
  text-align: center;
  padding: 20px;
}

/* MODAL */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: center;
  animation: fadeIn 0.25s ease-out;
  z-index: 1000;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-box {
  width: 320px;
  background: rgba(255,255,255,0.12);
  border-radius: 14px;
  padding: 25px;
  box-shadow: 0 0 18px rgba(0,0,0,0.45);
  animation: popupIn 0.25s ease-out;
  border: 1px solid rgba(255,255,255,0.25);
  backdrop-filter: blur(12px);
}

body.light .modal-box {
  background: white;
  color: black;
  border: 1px solid #ddd;
}

@keyframes popupIn {
  from { transform: scale(0.85); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.modal-title {
  font-size: 22px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 10px;
}

.modal-text {
  text-align: center;
  margin-bottom: 22px;
  font-size: 15px;
}

.modal-buttons {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.modal-cancel,
.modal-delete {
  flex: 1;
  padding: 10px 10px;
  border-radius: 8px;
  font-size: 15px;
  border: none;
  cursor: pointer;
  transition: 0.2s;
}

.modal-cancel {
  background: grey;
  color: white;
}

.modal-delete {
  background: #dc2626;
  color: white;
}

.modal-cancel:hover,
.modal-delete:hover {
  opacity: 0.85;
}
      `}</style>
    </div>
  );
}
