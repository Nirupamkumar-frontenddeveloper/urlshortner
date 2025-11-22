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

    const interval = setInterval(fetchLinks, 3000);

    if (localStorage.getItem("theme") === "light") {
      document.body.classList.remove("dark");
      document.body.classList.add("light");
    }

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

      <button className="theme-toggle" onClick={toggleTheme}>🌓</button>

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
              const shortUrl =
                typeof window !== "undefined"
                  ? `${window.location.origin}/${l.code}`
                  : "";

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
  transition: .4s;
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

.container {
  max-width: 900px;
  margin: auto;
  padding: 20px;
}

.theme-toggle {
  background: #444;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 50%;
  float: right;
  cursor: pointer;
  font-size: 18px;
}

.title {
  text-align: center;
  font-size: 32px;
  font-weight: 800;
  margin-top: 20px;
  margin-bottom: 25px;
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
  font-size: 15px;
}

.button {
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(to right,#7c3aed,#2563eb);
  color: white;
  cursor: pointer;
  font-size: 16px;
  font-weight: 700;
}

.table-wrapper {
  overflow-x: auto;
  border-radius: 14px;
  background: rgba(255,255,255,0.10);
  border: 1px solid rgba(255,255,255,0.15);
}

.table {
  width: 100%;
  min-width: 600px;
  border-collapse: collapse;
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.shorturl a, .url a {
  color: #60a5fa;
  text-decoration: none;
}

.shorturl a:hover, .url a:hover {
  text-decoration: underline;
}

.code {
  font-weight: bold;
  color: #c084fc;
}

.center { text-align: center; }

.actions { display: flex; gap: 8px; }

.copy-btn, .stats-btn, .delete-btn {
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 13px;
}

.copy-btn { background: #2563eb; color: white; }
.stats-btn { background: #facc15; color: black; }
.delete-btn { background: #dc2626; color: white; }

.empty {
  text-align: center;
  padding: 20px;
  color: #aaa;
}

/* Mobile */
@media (max-width: 600px) {
  .title { font-size: 26px; }
  .input, .button { font-size: 14px; }
  .actions { flex-direction: column; }
  .copy-btn, .stats-btn, .delete-btn {
    width: 100%;
    text-align: center;
  }
}

/* Modal */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
}

.popup {
  width: 300px;
  background: rgba(255,255,255,0.12);
  padding: 25px;
  border-radius: 16px;
  text-align: center;
  border: 1px solid rgba(255,255,255,0.15);
  backdrop-filter: blur(20px);
  animation: zoom .2s ease-out;
}

@keyframes zoom {
  from { transform: scale(0.85); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.popup-buttons {
  display: flex;
  gap: 10px;
}

.btn {
  flex: 1;
  padding: 10px;
  border-radius: 10px;
  cursor: pointer;
  border: none;
}

.cancel { background: #6b7280; color: white; }
.delete { background: #dc2626; color: white; }

.btn:hover { opacity: 0.85; }
      `}</style>

    </div>
  );
}
