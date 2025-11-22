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
    document.body.classList.add("dark");

    if (localStorage.getItem("theme") === "light") {
      document.body.classList.remove("dark");
      document.body.classList.add("light");
    }

    fetchLinks();
    const interval = setInterval(fetchLinks, 3000);
    return () => clearInterval(interval);
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
    fetchLinks();
  }

  function toggleTheme() {
    if (document.body.classList.contains("light")) {
      document.body.classList.remove("light");
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark");
      document.body.classList.add("light");
      localStorage.setItem("theme", "light");
    }
  }

  return (
    <div className="container">

      <div className="themeToggle" onClick={toggleTheme}>
        <div className="thumb"></div>
      </div>

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

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Short URL</th>
              <th>Code</th>
              <th>Long URL</th>
              <th>Clicks</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {links.map((l) => {
              const shortUrl =
                typeof window !== "undefined"
                  ? `${window.location.origin}/${l.code}`
                  : "";

              return (
                <tr key={l.code}>
                  <td>
                    <a href={shortUrl} target="_blank">{shortUrl}</a>
                  </td>

                  <td>{l.code}</td>

                  <td className="url">
                    <a href={l.url} target="_blank">{l.url}</a>
                  </td>

                  <td>{l.clicks}</td>

                  <td className="actions">
                    <button className="copy-btn"
                      onClick={() => navigator.clipboard.writeText(shortUrl)}>
                      Copy
                    </button>

                    <a className="stats-btn" href={`/code/${l.code}`}>Stats</a>

                    <button className="delete-btn"
                      onClick={() => showDelete(l.code)}>
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}

            {links.length === 0 && (
              <tr><td colSpan="5" className="empty">No links created yet</td></tr>
            )}
          </tbody>

        </table>
      </div>

      {showModal && (
        <div className="overlay">
          <div className="popup">
            <h3>Delete Link?</h3>
            <p>Delete <b>{deleteCode}</b>?</p>

            <div className="popup-buttons">
              <button className="btn cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn delete" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <style>{`

body {
  margin: 0;
  padding: 0;
  transition: .3s;
}

body.dark { background: #0a0a0a; color: white; }
body.light { background: white; color: black; }

.container {
  max-width: 900px;
  margin: auto;
  padding: 20px;
}

/* Toggle */
.themeToggle {
  width: 50px;
  height: 26px;
  background: #444;
  border-radius: 20px;
  padding: 3px;
  cursor: pointer;
  position: absolute;
  right: 20px;
  top: 20px;
}
.themeToggle .thumb {
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: .3s;
}
body.light .themeToggle {
  background: #ccc;
}
body.light .themeToggle .thumb {
  transform: translateX(24px);
}

/* Title */
.title {
  text-align: center;
  font-size: 32px;
  margin-top: 50px;
  font-weight: 800;
  background: linear-gradient(to right,#a855f7,#3b82f6);
  -webkit-background-clip: text;
  color: transparent;
}

/* Form */
.card {
  background: #1e1e1e;
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 25px;
}
body.light .card { background: #efefef; }

.form {
  display: grid;
  gap: 14px;
}
.input {
  padding: 12px;
  border-radius: 8px;
  border: none;
}
.button {
  padding: 12px;
  border: none;
  color: white;
  background: linear-gradient(to right,#7c3aed,#2563eb);
  border-radius: 8px;
  font-size: 16px;
}
.error { color: #ff5252; }
.success { color: #4ade80; }

/* TABLE ALWAYS FULLY VISIBLE */
.table-container {
  width: 100%;
  overflow: hidden;
}

.table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  padding: 12px;
  border-bottom: 1px solid #333;
}
th {
  background: #222;
}
body.light th { background: #ddd; }

/* URLs clickable */
td a {
  color: #60a5fa;
  text-decoration: none;
  word-break: break-all;
}

/* Action Buttons */
.actions {
  display: flex;
  gap: 6px;
}
.copy-btn, .stats-btn, .delete-btn {
  padding: 7px 12px;
  border-radius: 6px;
  font-size: 13px;
  border: none;
  cursor: pointer;
}
.copy-btn { background: #2563eb; color: white; }
.stats-btn { background: #facc15; color: black; }
.delete-btn { background: #dc2626; color: white; }

/* Solid Delete Popup */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.85);
  display:flex;
  justify-content:center;
  align-items:center;
  z-index: 9999;
}
.popup {
  background: #1e1e1e;
  color:white;
  padding: 25px;
  width: 300px;
  border-radius: 14px;
  text-align:center;
}
body.light .popup {
  background:white;
  color:black;
}
.popup-buttons {
  display:flex;
  gap:10px;
  margin-top:20px;
}
.btn {
  flex:1;
  padding:10px;
  border:none;
  border-radius:10px;
  cursor:pointer;
}
.cancel { background:#777; color:white; }
.delete { background:#dc2626; color:white; }

      `}</style>
    </div>
  );
}
