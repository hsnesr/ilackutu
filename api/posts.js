import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const postsFile = path.join(process.cwd(), 'data', 'posts.json');

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Başlık ve içerik gerekli.' });
    }

    let posts = [];

    try {
      const fileData = fs.readFileSync(postsFile, 'utf8');
      posts = JSON.parse(fileData);
    } catch (err) {
      posts = [];
    }

    const newPost = {
      id: Date.now(),
      title,
      content
    };

    posts.unshift(newPost);
    fs.writeFileSync(postsFile, JSON.stringify(posts, null, 2));

    return res.status(201).json({ message: 'İçerik kaydedildi.', post: newPost });
  }

  if (req.method === 'GET') {
    try {
      const fileData = fs.readFileSync(postsFile, 'utf8');
      const posts = JSON.parse(fileData);
      return res.status(200).json(posts);
    } catch (err) {
      return res.status(200).json([]);
    }
  }

  return res.status(405).json({ error: 'Yalnızca GET ve POST isteklerine izin verilir.' });
}
