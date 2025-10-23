// src/server/index.js
const express = require("express");
const path = require("path");
const helmet = require("helmet");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mysql = require("mysql2/promise");
const { validateRegister } = require("./validationRegister");
require("dotenv").config();

const app = express();

/* =========================
   1) Seguridad: Helmet (como en el ejemplo del profe)
   ========================= */
app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'"],
      "style-src": ["'self'", "'unsafe-inline'"],
      "img-src": ["'self'", "data:"],
      "font-src": ["'self'"],
      "object-src": ["'none'"],
      "base-uri": ["'self'"],
      "frame-ancestors": ["'none'"],
    },
  })
);
app.use(helmet.frameguard({ action: "deny" }));
app.use(helmet.noSniff());
app.use(helmet.referrerPolicy({ policy: "no-referrer" }));

// Salud (para testear cabeceras)
app.get("/health", (req, res) => res.status(200).send("ok"));

/* =========================
   2) Middlewares base + estáticos
   ========================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../client")));
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "../client/index.html"))
);

/* =========================
   3) Conexión MySQL (parametrizada, anti-SQLi)
   ========================= */
let pool;
async function initDB() {
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
  });

  const conn = await pool.getConnection();
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users(
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(120) UNIQUE NOT NULL,
        password VARCHAR(200) NOT NULL,
        attempts INT DEFAULT 0,
        locked_until BIGINT DEFAULT 0
      ) ENGINE=InnoDB;
    `);
    await conn.query(`
      CREATE TABLE IF NOT EXISTS products(
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(120),
        category VARCHAR(80),
        price DECIMAL(10,2),
        stock INT
      ) ENGINE=InnoDB;
    `);
  } finally {
    conn.release();
  }
}
initDB().catch(console.error);

/* =========================
   4) Helpers
   ========================= */
const SECRET = process.env.JWT_SECRET || "supersecretkey";

// auth middleware estilo “Bearer …”
function authJwt(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return res.status(401).json({ message: "No token" });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}

/* =========================
   5) Endpoints (siguiendo la guía y el ejemplo del profe)
   ========================= */

// REGISTER (mantiene tu validateRegister y guarda en BD)
app.post("/register", validateRegister, async (req, res) => {
  const { correo, contrasena } = req.body; // tu validador ya exige los demás campos
  if (!correo || !contrasena) {
    return res.status(400).send("Faltan campos");
  }
  try {
    const [rows] = await pool.query("SELECT id FROM users WHERE email = ?", [correo]);
    if (rows.length) return res.status(409).send("Duplicado");

    const hash = await bcrypt.hash(contrasena, 10);
    await pool.query("INSERT INTO users(email,password) VALUES(?,?)", [correo, hash]); // <- PARAMS
    // Tu test espera 200 con texto “✅ Registro exitoso!”
    return res.status(200).send("✅ Registro exitoso!");
  } catch (e) {
    return res.status(500).send("DB error");
  }
});

// LOGIN (con bloqueo tras 3 intentos fallidos)
app.post("/login", async (req, res) => {
  const { correo, contrasena } = req.body;
  const now = Date.now();
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [correo]); // <- PARAM
    const u = rows[0];
    if (!u) return res.status(401).send("Invalid");

    if (u.locked_until && u.locked_until > now) return res.status(423).send("Locked");

    const ok = await bcrypt.compare(contrasena, u.password);
    if (!ok) {
      const attempts = (u.attempts || 0) + 1;
      const locked = attempts >= 3 ? now + 15 * 60 * 1000 : 0;
      await pool.query(
        "UPDATE users SET attempts=?, locked_until=? WHERE id=?",
        [attempts, locked, u.id] // <- PARAMS
      );
      return res.status(401).send("Invalid");
    }

    await pool.query("UPDATE users SET attempts=0, locked_until=0 WHERE id=?", [u.id]);
    const token = jwt.sign({ sub: u.id, email: u.email }, SECRET, { expiresIn: "1h" });
    return res.json({ token });
  } catch (e) {
    return res.status(500).send("DB error");
  }
});

// PRODUCTS (protegido, anti-SQLi: category como parámetro)
app.get("/products", authJwt, async (req, res) => {
  const { category } = req.query;
  if (!category) return res.status(400).json({ message: "category required" });

  try {
    const [rows] = await pool.query(
      `SELECT * FROM products
       WHERE category = ? AND stock > 0 AND price IS NOT NULL`,
      [category] // <- PARAM (no concat)
    );
    return res.json(rows);
  } catch (e) {
    return res.status(500).json({ message: "DB error" });
  }
});

module.exports = app;
