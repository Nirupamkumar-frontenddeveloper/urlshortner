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

      {/* TABLE THAT WORKS ON ALL MOBILE SCREENS */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Short</th>
              <th>Code</th>
              <th>URL</th>
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
                  <td>{shortUrl}</td>
                  <td>{l.code}</td>
                  <td className="url">{l.url}</td>
                  <td>{l.clicks}</td>

                  <td className="actions">
                    <button className="copy-btn" onClick={() => navigator.clipboard.writeText(shortUrl)}>Copy</button>

                    <a className="stats-btn" href={`/code/${l.code}`}>Stats</a>

                    <button className="delete-btn" onClick={() => showDelete(l.code)}>Delete</button>
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

      {/* SOLID DELETE POPUP */}
      {showModal && (
        <div className="overlay">
          <div className="popup">
            <h3>Delete Link?</h3>
            <p>Are you sure you want to delete <b>{deleteCode}</b>?</p>

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
  overflow-x: hidden;
}
body.dark { background: #0a0a0a; color: white; }
body.light { background: white; color: black; }

.container {
  max-width: 900px;
  margin: auto;
  padding: 20px;
}

/* THEME TOGGLE */
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
  transition: .3s;
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

/* TITLE */
.title {
  text-align: center;
  margin-bottom: 25px;
  margin-top: 40px;
  font-size: 32px;
  font-weight: 800;
  background: linear-gradient(to right,#a855f7,#3b82f6);
  -webkit-background-clip: text;
  color: transparent;
}

/* FORM CARD */
.card {
  padding: 20px;
  background: #1a1a1a;
  border-radius: 14px;
  margin-bottom: 25px;
  border: 1px solid #333;
}
body.light .card { background: #f0f0f0; }

.form { display: grid; gap: 14px; }
.input {
  padding: 12px;
  border-radius: 8px;
  border: none;
  font-size: 15px;
}
.button {
  padding: 12px;
  background: linear-gradient(to right,#7c3aed,#2563eb);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
}
.error { color: #ff5252; }
.success { color: #4ade80; }

/* TABLE (FULLY MOBILE SAFE, NO SCROLL) */
.table-container {
  width: 100%;
}

.table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  padding: 12px;
  border-bottom: 1px solid #333;
}
th { background: #222; }
body.light th { background: #ddd; }

.url {
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ACTION BUTTONS */
.actions {
  display: flex;
  gap: 6px;
}
.copy-btn, .stats-btn, .delete-btn {
  padding: 7px 12px;
  border-radius: 6px;
  border: none;
  font-size: 13px;
  cursor: pointer;
}
.copy-btn { background: #2563eb; color: white; }
.stats-btn { background: #facc15; color: black; }
.delete-btn { background: #dc2626; color: white; }

/* MOBILE CLEAN STACK TABLE */
@media(max-width: 650px){
  th { display: none; }
  tr {
    background: #111;
    margin-bottom: 12px;
    padding: 12px;
    border-radius: 12px;
    display: block;
  }
  body.light tr { background: #eee; }

  td {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border: none;
  }

  td::before {
    content: attr(data-label);
    font-weight: bold;
    opacity: .7;
  }

  .actions {
    flex-direction: column;
    gap: 8px;
  }
}

/* SOLID DELETE POPUP */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.85);
  display:flex;
  justify-content:center;
  align-items:center;
  z-index: 9999;
}

.popup {
  width: 300px;
  background: #1e1e1e;
  border-radius: 12px;
  padding: 25px;
  text-align:center;
  color:white;
  animation: zoom .2s ease-out;
}
body.light .popup { background:white; color:black; }

@keyframes zoom {
  from { transform: scale(.85); opacity:0; }
  to { transform: scale(1); opacity:1; }
}

.popup-buttons {
  display:flex;
  gap:10px;
  margin-top:20px;
}

.btn {
  flex:1;
  padding:10px;
  border-radius:10px;
  border:none;
  cursor:pointer;
}
.cancel { background:#6b7280; color:white; }
.delete { background:#dc2626; color:white; }

      `}</style>
    </div>
  );
}
