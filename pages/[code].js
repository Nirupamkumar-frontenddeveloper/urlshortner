import { query } from "../lib/db";

export async function getServerSideProps({ params, res }) {
  const { code } = params;

  const result = await query(
    "SELECT url FROM links WHERE code=$1",
    [code]
  );

  if (result.rowCount === 0) {
    res.statusCode = 404;
    return { props: {} };
  }

  const targetUrl = result.rows[0].url;

  await query(
    "UPDATE links SET clicks = clicks + 1, last_clicked = NOW() WHERE code=$1",
    [code]
  );

  res.writeHead(302, { Location: targetUrl });
  res.end();

  return { props: {} };
}

export default function RedirectPage() {
  return null;
}
