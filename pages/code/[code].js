import { query } from "../../lib/db";
import { useEffect } from "react";

export default function Stats({ data }) {
  useEffect(() => {
    const theme = localStorage.getItem("theme") || "dark";
    document.body.className = theme; // simple & solid
  }, []);

  const toggleTheme = () => {
    const newTheme = document.body.classList.contains("dark") ? "light" : "dark";
    document.body.className = newTheme;
    localStorage.setItem("theme", newTheme);
  };

  if (!data) {
    return (
      <div className="wrapper">
        <div className="notfound">Stats Not Found</div>
        <a href="/" className="backbtn">Back to Dashboard</a>
        <style jsx global>{styles}</style>
      </div>
    );
  }

  return (
    <>
      {/* Fixed Toggle - Top Right */}
      <div className="toggle" onClick={toggleTheme}>
        <div className="thumb" />
      </div>

      <div className="wrapper">
        <h1 className="title">Stats for: {data.code}</h1>

        <div className="card">
          <div className="row">
            <span>Short Code</span>
            <span>{data.code}</span>
          </div>
          <div className="row">
            <span>Target URL</span>
            <a href={data.url} target="_blank" rel="noopener" className="url">
              {data.url}
            </a>
          </div>
          <div className="row">
            <span>Total Clicks</span>
            <span>{data.clicks}</span>
          </div>
          <div className="row">
            <span>Last Clicked</span>
            <span>{data.last_clicked || "Never"}</span>
          </div>
          <div className="row">
            <span>Created At</span>
            <span>{data.created_at}</span>
          </div>

          {/* Back button inside card */}
          <a href="/" className="backbtn">
            Back to Dashboard
          </a>
        </div>
      </div>

      <style jsx global>{styles}</style>
    </>
  );
}

export async function getServerSideProps({ params }) {
  const { code } = params;
  const r = await query("SELECT * FROM links WHERE code=$1", [code]);

  if (r.rowCount === 0) return { props: { data: null } };

  const row = r.rows[0];

  return {
    props: {
      data: {
        code: row.code,
        url: row.url,
        clicks: row.clicks,
        last_clicked: row.last_clicked
          ? new Date(row.last_clicked).toLocaleString()
          : null,
        created_at: new Date(row.created_at).toLocaleDateString(),
      },
    },
  };
}

const styles = `
  * { box-sizing: border-box; }
  body { margin:0; font-family: system-ui, sans-serif; transition: 0.3s; min-height:100vh; }
  body.dark { background: #0f0f0f; color: #eee; }
  body.light { background: #f8fafc; color: #222; }

  body::before {
    content:"";
    position:fixed;
    inset:0;
    background:linear-gradient(120deg,#3b82f6,#a855f7,#ec4899);
    filter:blur(120px);
    opacity:0.18;
    z-index:-1;
    animation:move 15s infinite alternate;
  }
  @keyframes move { 0%{transform:translate(-10%,-10%)} 100%{transform:translate(10%,10%)} }

  /* Fixed Toggle */
  .toggle {
    position: fixed;
    top: 20px;
    right: 20px;
    width: 60px;
    height: 34px;
    background: #333;
    border-radius: 50px;
    padding: 5px;
    cursor: pointer;
    z-index: 9999;
    box-shadow: 0 4px 15px rgba(0,0,0,0.4);
  }
  body.light .toggle { background: #999; }
  .thumb {
    width: 24px;
    height: 24px;
    background: white;
    border-radius: 50%;
    transition: 0.3s;
  }
  body.light .thumb { transform: translateX(26px); }

  .wrapper {
    max-width: 600px;
    margin: 0 auto;
    padding: 100px 20px 40px;
    text-align: center;
  }

  .title {
    font-size: 2.4rem;
    font-weight: 900;
    background: linear-gradient(to right, #a855f7, #3b82f6);
    -webkit-background-clip: text;
    color: transparent;
    margin-bottom: 30px;
  }

  .card {
    background: rgba(255,255,255,0.1);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 18px;
    padding: 30px;
    text-align: left;
  }
  body.light .card {
    background: rgba(255,255,255,0.95);
    border: 1px solid #ddd;
  }

  .row {
    display: flex;
    justify-content: space-between;
    padding: 16px 0;
    border-bottom: 1px solid rgba(255,255,255,0.15);
    font-size: 1.05rem;
  }
  body.light .row { border-color: #e0e0e0; }
  .row:last-of-type { border:none; }
  .row span:first-child { font-weight: 600; opacity: 0.9; }
  .url { color: #60a5fa; word-break: break-all; }
  body.light .url { color: #2563eb; }

  .backbtn {
    display: block;
    margin-top: 25px;
    padding: 14px;
    background: #3b82f6;
    color: white;
    text-align: center;
    border-radius: 12px;
    font-weight: 600;
    text-decoration: none;
    transition: 0.2s;
  }
  .backbtn:hover { background: #2563eb; transform: translateY(-2px); }

  /* Mobile */
  @media (max-width: 600px) {
    .wrapper { padding: 90px 15px 30px; }
    .title { font-size: 2rem; }
    .card { padding: 22px; }
    .row { flex-direction: column; gap: 6px; font-size: 1rem; }
    .toggle { top:15px; right:15px; width:52px; height:30px; }
    .thumb { width:20px; height:20px; }
    body.light .thumb { transform: translateX(22px); }
  }

  .notfound {
    font-size: 2rem;
    font-weight: bold;
    text-align: center;
    margin-top: 100px;
  }
`;