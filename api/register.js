import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const SECRET_KEY = process.env.JWT_SECRET || 'gizli_anahtar';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Eksik bilgi' });
  }

  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .maybeSingle();

  if (existingUser) {
    return res.status(409).json({ success: false, message: 'Kullanıcı zaten var' });
  }

  const { error } = await supabase
    .from('users')
    .insert([{ username, password }]);

  if (error) {
    return res.status(500).json({ success: false, message: 'Kayıt başarısız' });
  }

  res.status(201).json({ success: true });
}
