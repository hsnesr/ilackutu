// server/index.js

const express = require("express");
const path = require("path");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const PORT = 3000;
const SECRET_KEY = process.env.JWT_SECRET || "gizli_anahtar";

const supabase = require("./supabaseClient");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

// REGISTER: /api/register
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;

  // Hatalı giriş kontrolü
  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Eksik bilgi." });
  }

  // Aynı kullanıcı var mı?
  const { data: existingUser } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (existingUser) {
    return res.status(409).json({ success: false, message: "Kullanıcı zaten var." });
  }

  // Yeni kullanıcı ekle
  const { error } = await supabase
    .from("users")
    .insert([{ username, password }]);

  if (error) {
    return res.status(500).json({ success: false, message: "Kayıt başarısız." });
  }

  res.json({ success: true });
});
