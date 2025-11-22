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
    const data = await res.json();
    setLinks(data);
  }

  useEffect(() => {
    const theme = localStorage.getItem("theme") || "dark";
    document.body.className = theme;
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
      body: JSON.stringify({ url, code: code || undefined }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Something went wrong");
      return;
    }
    setUrl("");
    setCode("");
    setSuccess(`Created! -> ${window.location.origin}/${data.code}`);
    fetchLinks();
  }

  const safeCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const i = document.createElement("input");
      i.value = text;
      document.body.appendChild(i);
      i.select();
      document.execCommand("copy");
      document.body.removeChild(i);
    }
    alert("Copied!");
  };

  const toggleTheme = () => {
    const newTheme = document.body.classList.contains("dark") ? "light" : "dark";
    document.body.className = newTheme;
    localStorage.setItem("theme", newTheme);
  };

  return (
    <>
      <div className="theme-toggle" onClick={toggleTheme}>
        <div className="thumb" />
      </div>

      <div className="container">
        <h1 className="title">TinyLink – URL Shortener</h1>

        <div className="form-card">
          <form onSubmit={createLink}>
            <div className="input-wrapper">
              <input
                type="url"
                placeholder="https://example.com/very-long-url..."
                className="main-input"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>

            <div className="input-wrapper">
              <input
                type="text"
                placeholder="Custom code (optional)"
                className="main-input secondary"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\s/g, "").toLowerCase())}
                maxLength="20"
              />
            </div>

            <button type="submit" className="create-btn">
              Create Short Link
            </button>

            {error && <div className="msg error">{error}</div>}
            {success && <div className="msg success">{success}</div>}
          </form>
        </div>

        <div className="desktop-table">
          <table>
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
                const short = `${window.location.origin}/${l.code}`;
                return (
                  <tr key={l.code}>
                    <td>
                      <a href={short} target="_blank" rel="noopener">
                        {short}
                      </a>
                    </td>
                    <td>
                      <code>{l.code}</code>
                    </td>
                    <td className="long">
                      <a href={l.url} target="_blank" rel="noopener">
                        {l.url}
                      </a>
                    </td>
                    <td>{l.clicks}</td>
                    <td className="actions">
                      <button onClick={() => safeCopy(short)} className="act copy">
                        Copy
                      </button>
                      <a href={`/code/${l.code}`} className="act stats">
                        Stats
                      </a>
                      <button
                        onClick={() => {
                          setDeleteCode(l.code);
                          setShowModal(true);
                        }}
                        className="act delete"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mobile-cards">
          {links.map((l) => {
            const short = `${window.location.origin}/${l.code}`;
            return (
              <div key={l.code} className="mobile-card">
                <div className="mobile-row">
                  <span>Short URL</span>
                  <a href={short} target="_blank" rel="noopener">
                    {short}
                  </a>
                </div>
                <div className="mobile-row">
                  <span>Code</span>
                  <code>{l.code}</code>
                </div>
                <div className="mobile-row">
                  <span>Long URL</span>
                  <a href={l.url} target="_blank" rel="noopener" className="long-mobile">
                    {l.url}
                  </a>
                </div>
                <div className="mobile-row">
                  <span>Clicks</span>
                  <strong>{l.clicks}</strong>
                </div>
                <div className="mobile-actions">
                  <button onClick={() => safeCopy(short)} className="act copy">
                    Copy
                  </button>
                  <a href={`/code/${l.code}`} className="act stats">
                    Stats
                  </a>
                  <button
                    onClick={() => {
                      setDeleteCode(l.code);
                      setShowModal(true);
                    }}
                    className="act delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h3>Delete this link?</h3>
              <p>
                Permanently delete <b>{deleteCode}</b>?
              </p>
              <div className="modal-btns">
                <button onClick={() => setShowModal(false)} className="cancel">
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await fetch(`/api/links/${deleteCode}`, { method: "DELETE" });
                    setShowModal(false);
                    fetchLinks();
                  }}
                  className="confirm-delete"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        * { box-sizing: border-box; }
        body { margin: 0; font-family: system-ui, sans-serif; transition: 0.3s; min-height: 100vh; }
        body.dark { background: #0a0a0a; color: #eee; }
        body.light { background: #f9fafb; color: #111; }
        body::before { content: ""; position: fixed; inset: 0; background: linear-gradient(135deg, #667eea, #764ba2); filter: blur(120px); opacity: 0.2; z-index: -1; }

        .theme-toggle { position: fixed; top: 18px; right: 18px; z-index: 9999; width: 56px; height: 32px; background: #333; border-radius: 50px; padding: 4px; cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.4); }
        .theme-toggle .thumb { width: 24px; height: 24px; background: white; border-radius: 50%; transition: transform 0.3s ease; }
        body.light .theme-toggle { background: #999; }
        body.light .thumb { transform: translateX(24px); }

        .container { max-width: 1000px; margin: 0 auto; padding: 20px; padding-top: 80px; }
        .title { text-align: center; font-size: 2.5rem; font-weight: 900; margin: 0 0 30px; background: linear-gradient(to right, #a855f7, #3b82f6); -webkit-background-clip: text; color: transparent; }

        .form-card { background: rgba(255,255,255,0.08); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.15); border-radius: 16px; padding: 28px; margin-bottom: 30px; }
        body.light .form-card { background: white; border: 1px solid #e5e7eb; }

        .input-wrapper { margin-bottom: 20px; }
        .input-wrapper:last-of-type { margin-bottom: 0; }

        .main-input { width: 100%; padding: 18px 20px; font-size: 1.05rem; border: 2px solid transparent; border-radius: 14px; outline: none; transition: all 0.3s ease; background: rgba(255,255,255,0.12); color: inherit; }
        .main-input::placeholder { color: #aaaaaa; opacity: 0.8; font-weight: 500; }
        .main-input:focus { border-color: #7c3aed; background: rgba(255,255,255,0.18); box-shadow: 0 0 0 4px rgba(124,58,237,0.25); transform: translateY(-1px); }
        .main-input.secondary { font-size: 1rem; padding: 16px 20px; }

        body.light .main-input { background: #ffffff; border: 2px solid #e2e8f0; color: #111; }
        body.light .main-input::placeholder { color: #94a3b8; }
        body.light .main-input:focus { box-shadow: 0 0 0 4px rgba(124,58,237,0.15); }

        .create-btn { margin-top: 24px; padding: 18px; font-size: 1.15rem; font-weight: 700; border: none; border-radius: 14px; background: linear-gradient(135deg, #7c3aed, #3b82f6); color: white; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(124,58,237,0.4); }
        .create-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(124,58,237,0.5); }

        .msg { margin-top: 12px; padding: 12px; border-radius: 8px; text-align: center; font-weight: 500; }
        .error { background: #fee2e2; color: #dc2626; }
        .success { background: #dcfce7; color: #16a34a; }

        .desktop-table { display: block; }
        .mobile-cards { display: none; }

        table { width: 100%; border-collapse: collapse; background: rgba(0,0,0,0.2); border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); }
        body.light table { background: white; border: 1px solid #e5e7eb; }
        th, td { padding: 14px; text-align: left; }
        th { background: rgba(0,0,0,0.4); font-weight: 600; }
        body.light th { background: #f1f5f9; }

        .actions { white-space: nowrap; }
        .act { padding: 8px 12px; margin-right: 6px; border: none; border-radius: 6px; font-size: 0.9rem; cursor: pointer; font-weight: 600; }
        .copy { background: #2563eb; color: white; }
        .stats { background: #facc15; color: black; }
        .delete { background: #dc2626; color: white; }

        @media (max-width: 768px) {
          .desktop-table { display: none; }
          .mobile-cards { display: block; }
          .input-wrapper { margin-bottom: 22px; }
          .main-input { padding: 20px 22px; font-size: 1.1rem; }
          .create-btn { padding: 20px; font-size: 1.2rem; margin-top: 28px; }

          .mobile-card { background: rgba(255,255,255,0.08); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.15); border-radius: 14px; padding: 18px; margin-bottom: 16px; }
          body.light .mobile-card { background: white; border: 1px solid #e5e7eb; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }

          .mobile-row { display: flex; justify-content: space-between; align-items: flex-start; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 0.95rem; }
          body.light .mobile-row { border-color: #e5e7eb; }
          .mobile-row:last-of-type { border: none; }
          .mobile-row span:first-child { opacity: 0.8; min-width: 100px; }

          .mobile-actions { display: flex; gap: 10px; margin-top: 16px; }
          .mobile-actions .act { flex: 1; padding: 14px; font-size: 1rem; }
        }

        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 9999; }
        .modal { background: #1a1a1a; padding: 30px; border-radius: 16px; width: 90%; max-width: 400px; text-align: center; border: 1px solid #333; }
        body.light .modal { background: white; color: #111; border: 1px solid #ddd; }
        .modal-btns { display: flex; gap: 12px; margin-top: 20px; }
        .modal-btns button { flex: 1; padding: 12px; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; }
        .cancel { background: #666; color: white; }
        .confirm-delete { background: #dc2626; color: white; }
      `}</style>
    </>
  );
}