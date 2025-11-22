import { query } from "../../lib/db";

export default function Stats({ data }) {
  if (!data) {
    return (
      <div className="container">
        <h1 className="title">Stats Not Found</h1>

        <a href="/" className="back-btn">⬅ Back to Dashboard</a>

        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="container">

      {/* THEME BUTTON */}
      <button className="theme-toggle" onClick={() => toggleTheme()}>
        🌓 Theme
      </button>

      <h1 className="title">Stats for: {data.code}</h1>

      <div className="card">
        <div className="stat-row">
          <span className="label">Short Code:</span>
          <span className="value">{data.code}</span>
        </div>

        <div className="stat-row">
          <span className="label">Target URL:</span>
          <span className="value">
            <a href={data.url} target="_blank" className="url-link">{data.url}</a>
          </span>
        </div>

        <div className="stat-row">
          <span className="label">Total Clicks:</span>
          <span className="value">{data.clicks}</span>
        </div>

        <div className="stat-row">
          <span className="label">Last Clicked:</span>
          <span className="value">{data.last_clicked || "Never"}</span>
        </div>

        <div className="stat-row">
          <span className="label">Created At:</span>
          <span className="value">{data.created_at}</span>
        </div>

        <a href="/" className="back-btn">⬅ Back to Dashboard</a>
      </div>

      <style>{styles}</style>
    </div>
  );
}

/* ---------------------- SERVER SIDE ---------------------- */

export async function getServerSideProps({ params }) {
  const { code } = params;

  const result = await query(
    "SELECT * FROM links WHERE code=$1",
    [code]
  );

  if (result.rowCount === 0) {
    return { props: { data: null } };
  }

  const row = result.rows[0];

  return {
    props: {
      data: {
        code: row.code,
        url: row.url,
        clicks: row.clicks,
        last_clicked: row.last_clicked ? new Date(row.last_clicked).toISOString() : null,
        created_at: row.created_at ? new Date(row.created_at).toISOString() : null
      }
    }
  };
}

/* ---------------------- GLOBAL THEME SCRIPT ---------------------- */

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

/* ---------------------- CSS ---------------------- */

const styles = `
body {
  margin: 0;
  padding: 0;
  transition: 0.4s;
}

/* DARK */
body.dark {
  background: #0a0a0a;
  color: white;
}

/* LIGHT */
body.light {
  background: #f0f0f0;
  color: black;
}

/* Animated background */
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

/* Layout */
.container {
  max-width: 700px;
  margin: auto;
  padding: 40px;
}

/* Title */
.title {
  text-align: center;
  font-size: 34px;
  font-weight: bold;
  margin-bottom: 30px;
  background: linear-gradient(to right,#a855f7,#3b82f6);
  -webkit-background-clip: text;
  color: transparent;
}

/* Card */
.card {
  background: rgba(255,255,255,0.12);
  padding: 30px;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.25);
  backdrop-filter: blur(15px);
  box-shadow: 0 0 20px rgba(0,0,0,0.4);
}

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255,255,255,0.15);
}

.label { font-weight: 600; opacity: 0.9; }
.value { font-weight: 500; }

.url-link {
  color: #60a5fa;
  text-decoration: none;
}
.url-link:hover { text-decoration: underline; }

/* Back button */
.back-btn {
  margin-top: 20px;
  display: inline-block;
  padding: 10px 15px;
  background: #2563eb;
  color: white;
  border-radius: 8px;
  text-decoration: none;
}
.back-btn:hover { opacity: 0.85; }

/* Theme Button */
.theme-toggle {
  float: right;
  background: #444;
  color: white;
  padding: 8px 14px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}
.theme-toggle:hover { opacity: 0.8; }
`;
