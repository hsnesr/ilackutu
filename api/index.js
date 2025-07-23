import 'dotenv/config';
import jwt from 'jsonwebtoken';

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Sadece POST istekleri kabul edilir." });
  }

  const { username, password } = req.body;

  const ADMIN_USER = process.env.ADMIN_USER;
  const ADMIN_PASS = process.env.ADMIN_PASS;
  const JWT_SECRET = process.env.JWT_SECRET;

  if (!username || !password) {
    return res.status(400).json({ error: "Kullanıcı adı ve şifre gerekli." });
  }
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" }); // 1 saat geçerli
    return res.status(200).json({ token });
  }

  return res.status(401).json({ error: "Geçersiz kullanıcı adı veya şifre." });
}
