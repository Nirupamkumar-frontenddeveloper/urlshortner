import { query } from "../../../lib/db";

const CODE_RE = /^[A-Za-z0-9]{6,8}$/;

function validateUrl(u) {
  try {
    const url = new URL(u);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    const rows = await query("SELECT * FROM links ORDER BY created_at DESC");
    return res.status(200).json(rows.rows);
  }

  if (req.method === "POST") {
    const { url, code } = req.body;

    if (!validateUrl(url)) {
      return res.status(400).json({ error: "Invalid URL" });
    }

    let finalCode = code || randomCode();

    if (code && !CODE_RE.test(code)) {
      return res.status(400).json({ error: "Invalid short code" });
    }

    try {
      await query("INSERT INTO links (code, url) VALUES ($1, $2)", [finalCode, url]);
      return res.status(201).json({ code: finalCode, url });
    } catch {
      return res.status(409).json({ error: "Short code already exists" });
    }
  }

  res.status(405).end();
}

function randomCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 7; i++) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}
