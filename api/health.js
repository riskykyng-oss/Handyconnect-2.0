export default function handler(_req, res) {
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
  return res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
}
