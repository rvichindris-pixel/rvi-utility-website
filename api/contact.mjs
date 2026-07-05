export default async function handler(req, res) {
  return res.status(200).json({ ok: true, node: process.version, hasKey: !!process.env.RESEND_API_KEY });
}
