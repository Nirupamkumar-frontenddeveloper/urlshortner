import { query } from "../../lib/db";
import { useEffect } from "react";

export default function Stats({ data }) {
  
  useEffect(() => {
    if (!localStorage.getItem("theme")) {
      document.body.classList.add("dark");
    } else {
      const t = localStorage.getItem("theme");
      document.body.classList.remove("dark", "light");
      document.body.classList.add(t);
    }
  }, []);

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

      <div className="themeToggle" onClick={toggleTheme}>
        <div className="thumb"></div>
      </div>

      <h1 className="title">Stats for: {data.code}</h1>

      <div className="card">

        <div className="row">
          <span className="label">Short Code:</span>
          <span className="value">{data.code}</span>
        </div>

        <div className="row">
          <span className="label">Target URL:</span>
          <span className="value">
            <a href={data.url} target="_blank" className="link">{data.url}</a>
          </span>
        </div>

        <div className="row">
          <span className="label">Total Clicks:</span>
          <span className="value">{data.clicks}</span>
        </div>

        <div className="row">
          <span className="label">Last Clicked:</span>
          <span className="value">{data.last_clicked || "Never"}</span>
        </div>

        <div className="row">
          <span className="label">Created At:</span>
          <span className="value">{data.created_at}</span>
        </div>

        <a href="/" className="back-btn">⬅ Back to Dashboard</a>
      </div>

      <style>{styles}</style>
    </div>
  );
}

/* SERVER SIDE */
export async function getServerSideProps({ params }) {
  const { code } = params;

  const r = await query("SELECT * FROM links WHERE code=$1", [code]);

  if (r.rowCount === 0) {
    return { props: { data: null } };
  }

  const row = r.rows[0];

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

/* CSS */
const styles = `

body { margin:0; padding:0; transition:.3s; }

/* DARK MODE */
body.dark { background:#0a0a0a; color:white; }

/* LIGHT MODE */
body.light { background:#ffffff; color:#111; }
body.light * { color:#111 !important; }

/* Animated Background */
body::before {
  content:"";
  position:fixed;
  inset:0;
  background:linear-gradient(120deg,#3b82f6,#a855f7,#ec4899);
  filter:blur(130px);
  opacity:0.20;
  animation:bgMove 12s infinite alternate;
  z-index:-1;
}
@keyframes bgMove {
  0%{transform:translateX(-20%);}
  100%{transform:translateX(20%);}
}

/* Theme Toggle */
.themeToggle {
  width:50px; height:26px;
  background:#444;
  border-radius:50px;
  padding:3px;
  cursor:pointer;
  position:absolute;
  right:20px; top:20px;
}
.thumb {
  width:20px; height:20px;
  background:white;
  border-radius:50%;
  transition:.3s;
}
body.light .themeToggle { background:#ccc; }
body.light .thumb { transform:translateX(24px); }

/* Layout */
.container {
  max-width:650px;
  margin:auto;
  padding:25px 20px;
}

/* Title */
.title {
  text-align:center;
  font-size:32px;
  margin-bottom:20px;
  font-weight:800;
  background:linear-gradient(to right,#a855f7,#3b82f6);
  -webkit-background-clip:text;
  color:transparent;
}

/* Card */
.card {
  background:rgba(255,255,255,0.1);
  padding:22px;
  border-radius:14px;
  border:1px solid rgba(255,255,255,0.25);
  backdrop-filter:blur(12px);
}
body.light .card {
  background:#f2f2f2;
  border-color:#ccc;
}

/* Rows */
.row {
  display:flex;
  justify-content:space-between;
  padding:12px 0;
  border-bottom:1px solid rgba(255,255,255,0.25);
}
body.light .row {
  border-color:#ccc;
}

.label { font-weight:600; opacity:0.9; }
.value { font-weight:500; }

.link {
  color:#60a5fa;
  text-decoration:none;
}
body.light .link { color:#2563eb !important; }
.link:hover { text-decoration:underline; }

/* Back Button */
.back-btn {
  margin-top:18px;
  display:inline-block;
  padding:10px 16px;
  border-radius:8px;
  background:#2563eb;
  color:white !important;
  text-decoration:none;
}
.back-btn:hover { opacity:0.85; }

/* MOBILE FIX */
@media(max-width:600px){

  .row {
    flex-direction:column;
    text-align:left;
    padding:14px 0;
    gap:6px;
  }

  .label {
    font-size:15px;
  }

  .value, .link {
    font-size:15px;
    word-break:break-all;
  }

  .container {
    padding:15px;
  }

  .card {
    padding:18px;
  }

  .back-btn {
    width:100%;
    text-align:center;
  }
}

`;
