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

  async function safeCopy(text) {
    try {
      await navigator?.clipboard?.writeText(text);
      alert("Copied!");
    } catch {
      const t = document.createElement("input");
      t.value = text;
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      t.remove();
      alert("Copied!");
    }
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

      <div className="table-wrapper desktop-only">
        <table className="clean-table">
          <thead>
            <tr>
              <th style={{ width: "23%" }}>Short URL</th>
              <th style={{ width: "12%" }}>Code</th>
              <th style={{ width: "33%" }}>Long URL</th>
              <th style={{ width: "10%" }}>Clicks</th>
              <th style={{ width: "22%" }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {links.map((l) => {
              const shortUrl = `${window.location.origin}/${l.code}`;
              return (
                <tr key={l.code}>
                  <td><a href={shortUrl} target="_blank">{shortUrl}</a></td>
                  <td>{l.code}</td>
                  <td className="long-url">
                    <a href={l.url} target="_blank">{l.url}</a>
                  </td>
                  <td>{l.clicks}</td>

                  <td className="btns">
                    <button className="copy" onClick={() => safeCopy(shortUrl)}>Copy</button>
                    <a className="stats" href={`/code/${l.code}`}>Stats</a>
                    <button className="delete" onClick={() => showDelete(l.code)}>Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>

        </table>
      </div>

      <div className="mobile-list">
        {links.map((l) => {
          const shortUrl = `${window.location.origin}/${l.code}`;
          return (
            <div className="link-card" key={l.code}>
              <div className="field">
                <label>Short URL</label>
                <a href={shortUrl} target="_blank">{shortUrl}</a>
              </div>

              <div className="field">
                <label>Code</label>
                <p>{l.code}</p>
              </div>

              <div className="field">
                <label>Long URL</label>
                <a href={l.url} target="_blank" className="long">{l.url}</a>
              </div>

              <div className="field">
                <label>Clicks</label>
                <p>{l.clicks}</p>
              </div>

              <div className="mobile-btns">
                <button className="copy">Copy</button>
                <a className="stats" href={`/code/${l.code}`}>Stats</a>
                <button className="delete" onClick={() => showDelete(l.code)}>Delete</button>
              </div>
            </div>
          );
        })}
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

/* MAIN FIXES INCLUDED BELOW ↓ */

/* GLOBAL */
body { margin:0; padding:0; transition:.3s; }
body.dark { background:#0a0a0a; color:white; }
body.light { background:white; color:#111; }

/* FIX LIGHT THEME TEXT */
body.light * {
  color:#111 !important;
}

/* CONTAINER */
.container { max-width:900px; margin:auto; padding:20px; }

/* THEME TOGGLE */
.themeToggle {
  width:50px; height:26px; background:#444;
  border-radius:50px; padding:3px; cursor:pointer;
  position:absolute; right:20px; top:20px;
}
.thumb {
  width:20px; height:20px; background:white;
  border-radius:50%; transition:.3s;
}
body.light .themeToggle { background:#ccc; }
body.light .thumb { transform:translateX(24px); }

/* TITLE */
.title {
  text-align:center; font-size:32px; margin-top:50px;
  font-weight:800;
  background:linear-gradient(to right,#a855f7,#3b82f6);
  -webkit-background-clip:text; color:transparent;
}

/* CARD */
.card {
  background:#1e1e1e; padding:20px; border-radius:14px;
  margin-bottom:25px;
}
body.light .card { background:#efefef; }

/* FORM */
.form { display:grid; gap:12px; }
.input { padding:12px; border-radius:8px; border:none; background:white; color:black; }
body.dark .input { background:#333; color:white; }

.button {
  padding:12px; border:none; border-radius:8px;
  background:linear-gradient(to right,#7c3aed,#2563eb);
  color:white; font-size:16px;
}

.error { color:#ff5252 !important; }
.success { color:#4ade80 !important; }

/* TABLE */
.table-wrapper {
  background:#111; padding:18px;
  border-radius:12px; border:1px solid #222;
}
body.light .table-wrapper { background:#f2f2f2; border-color:#ccc; }

.clean-table { width:100%; border-collapse:collapse; }

th {
  text-align:left; padding:12px;
  background:#181818;
  border-bottom:2px solid #222; color:#ccc;
}
body.light th { background:#e1e1e1; color:black; border-color:#ccc; }

td {
  padding:12px; border-bottom:1px solid #222; color:#ddd;
}
body.light td { color:black; border-color:#ccc; }

.clean-table a { color:#60a5fa; }
body.light .clean-table a { color:#2563eb !important; }

/* BUTTONS */
.btns {
  display:flex;
  gap:6px;
  justify-content:space-between;
}
.copy, .stats, .delete {
  padding:8px 10px;
  font-size:14px;
  border-radius:6px;
  border:none;
  cursor:pointer;
  flex:1;
  text-align:center;
}
.copy { background:#2563eb; color:white !important; }
.stats { background:#facc15; color:black !important; }
.delete { background:#dc2626; color:white !important; }

/* MOBILE */
.mobile-list { display:none; }

@media(max-width:650px){
  .desktop-only { display:none; }
  .mobile-list { display:block; }

  .link-card {
    background:#151515;
    padding:15px;
    border-radius:10px;
    border:1px solid #222;
    margin-bottom:15px;
  }
  body.light .link-card { background:#efefef; border-color:#ccc; }

  label { opacity:0.9 !important; }

  a { color:#60a5fa !important; }
  body.light a { color:#2563eb !important; }

  /* FIXED BUTTON WIDTH */
  .mobile-btns {
    margin-top:12px;
    display:flex;
    flex-direction:column;
    gap:10px;
  }

  .mobile-btns .copy,
  .mobile-btns .stats,
  .mobile-btns .delete {
    width:100%;
    display:block;
    text-align:center;
    padding:12px;
    font-size:15px;
  }
}

/* MODAL */
.overlay {
  position:fixed; inset:0; background:rgba(0,0,0,.85);
  display:flex; justify-content:center; align-items:center;
}
.popup {
  width:300px; background:#1e1e1e;
  padding:25px; border-radius:12px; text-align:center;
}
body.light .popup { background:white; color:black; }

.popup-buttons {
  display:flex; gap:10px; margin-top:20px;
}

.btn {
  flex:1; padding:10px; border:none;
  border-radius:10px; cursor:pointer;
}
.cancel { background:#777; color:white !important; }
.delete { background:#dc2626; color:white !important; }

      `}</style>
    </div>
  );
}
