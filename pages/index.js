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
    setDeleteCode("");
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

  function copyToClipboard(txt) {
    navigator.clipboard.writeText(txt);
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


      <div className="table-wrapper">
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
              const shortUrl = typeof window !== "undefined" ? `${window.location.origin}/${l.code}` : "";
              return (
                <tr key={l.code}>
                  <td data-label="Short URL" className="shorturl">
                    <a href={shortUrl} target="_blank">{shortUrl}</a>
                  </td>

                  <td data-label="Code" className="code">{l.code}</td>

                  <td data-label="URL" className="url">
                    <a href={l.url} target="_blank">{l.url}</a>
                  </td>

                  <td data-label="Clicks" className="center">{l.clicks}</td>

                  <td data-label="Actions" className="actions">
                    <button className="copy-btn" onClick={() => copyToClipboard(shortUrl)}>
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
        <div className="overlay" onClick={() => setShowModal(false)}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Link?</h3>
            <p>Are you sure you want to delete <b>{deleteCode}</b>?</p>

            <div className="popup-buttons">
              <button className="btn cancel" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn delete" onClick={confirmDelete}>
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
  transition: .3s;
  overflow-x: hidden;
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
  z-index: -1;
  animation: bgMove 10s infinite alternate;
  background: linear-gradient(120deg,#3b82f6,#a855f7,#ec4899);
  filter: blur(150px);
  opacity: .18;
}
@keyframes bgMove {
  0% { transform: translateX(-20%); }
  100% { transform: translateX(20%); }
}

/* Toggle Switch */
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
  display: flex;
  align-items: center;
}

.themeToggle .thumb {
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: .3s;
}

body.light .themeToggle {
  background: #bbb;
}
body.light .themeToggle .thumb {
  transform: translateX(24px);
}

.container {
  max-width: 900px;
  padding: 20px;
  margin: auto;
}

.title {
  text-align: center;
  margin-top: 40px;
  font-size: 32px;
  font-weight: 800;
  background: linear-gradient(to right,#a855f7,#3b82f6);
  -webkit-background-clip: text;
  color: transparent;
}

.card {
  background: rgba(255,255,255,0.12);
  padding: 20px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.15);
  backdrop-filter: blur(10px);
  margin-bottom: 25px;
}

.form { display: grid; gap: 14px; }

.input {
  padding: 12px;
  border-radius: 8px;
  border: none;
}

.button {
  padding: 12px;
  border-radius: 8px;
  background: linear-gradient(to right,#7c3aed,#2563eb);
  color: white;
  border: none;
  font-size: 16px;
  cursor: pointer;
}

.table-wrapper {
  overflow-x: auto;
  border-radius: 14px;
  background: rgba(255,255,255,0.10);
  border: 1px solid rgba(255,255,255,0.15);
}

.table {
  width: 100%;
  border-collapse: collapse;
  min-width: 650px;
}

th, td {
  padding: 12px;
}

th {
  background: rgba(255,255,255,0.15);
}

td {
  border-top: 1px solid rgba(255,255,255,0.15);
}

.shorturl, .url {
  max-width: 180px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.shorturl a, .url a { color: #60a5fa; }

.code { font-weight: bold; color: #c084fc; }

.actions { display: flex; gap: 8px; }

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

.empty { text-align:center; padding:20px; color:#aaa; }

/* MOBILE RESPONSIVE TABLE */
@media(max-width:700px){
  table, thead, tbody, th, td, tr { display:block; width:100%; }

  th { display:none; }

  tr {
    background: rgba(255,255,255,0.08);
    margin-bottom: 12px;
    padding: 10px;
    border-radius: 12px;
  }

  td {
    border: none;
    display:flex;
    justify-content: space-between;
    padding: 8px 5px;
  }

  td::before {
    content: attr(data-label);
    font-weight: bold;
    opacity: .8;
  }

  .actions { flex-direction: column; }
}

/* Modal */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  backdrop-filter: blur(5px);
  display:flex;
  justify-content:center;
  align-items:center;
}

.popup {
  width: 300px;
  background: rgba(255,255,255,0.12);
  border-radius: 16px;
  padding: 25px;
  animation: zoom .2s ease-out;
  text-align:center;
  border: 1px solid rgba(255,255,255,0.15);
  backdrop-filter: blur(20px);
}

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
