
require("dotenv").config();
console.log("DATABASE_URL:", process.env.DATABASE_URL);

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs"); // criptografia de senha
const jwt = require("jsonwebtoken");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// Socket.IO configurado para permitir conexões de qualquer origem (CORS)
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());

// Conexão com PostgreSQL (Supabase)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.connect()
  .then(() => console.log("✅ Conectado ao PostgreSQL"))
  .catch((err) => console.error("❌ Erro ao conectar:", err));

// ----------------- ROTAS -----------------

// Rota de teste
app.get("/", (req, res) => {
  res.send("Servidor funcionando 🚀");
});

// ----------------- REGISTRO -----------------
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }

  try {
    const hashed = await bcrypt.hash(password, 10); // criptografa a senha

    const result = await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, created_at",
      [username, email, hashed]
    );

    res.json({ message: "Usuário registrado com sucesso", user: result.rows[0] });
  } catch (err) {
    if (err.code === "23505") { // violação de UNIQUE
      res.status(400).json({ error: "Email ou username já existe" });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// ----------------- LOGIN -----------------
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0)
      return res.status(400).json({ error: "Usuário não encontrado" });

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) return res.status(400).json({ error: "Senha incorreta" });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ message: "Login realizado com sucesso", token, username: user.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------- SOCKET.IO (CHAT EM TEMPO REAL) -----------------
io.on("connection", (socket) => {
  console.log("Usuário conectado:", socket.id);

  // Recebe mensagem do frontend e envia para todos
  socket.on("send_message", (msg) => {
    io.emit("receive_message", msg);
  });

  socket.on("disconnect", () => {
    console.log("Usuário desconectado:", socket.id);
  });
});

// ----------------- INICIAR SERVIDOR -----------------
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

require("dotenv").config();
console.log("DATABASE_URL:", process.env.DATABASE_URL);

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs"); // criptografia de senha
const jwt = require("jsonwebtoken");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// Socket.IO configurado para permitir conexões de qualquer origem (CORS)
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());

// Conexão com PostgreSQL (Supabase)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.connect()
  .then(() => console.log("✅ Conectado ao PostgreSQL"))
  .catch((err) => console.error("❌ Erro ao conectar:", err));

// ----------------- ROTAS -----------------

// Rota de teste
app.get("/", (req, res) => {
  res.send("Servidor funcionando 🚀");
});

// ----------------- REGISTRO -----------------
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }

  try {
    const hashed = await bcrypt.hash(password, 10); // criptografa a senha

    const result = await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, created_at",
      [username, email, hashed]
    );

    res.json({ message: "Usuário registrado com sucesso", user: result.rows[0] });
  } catch (err) {
    if (err.code === "23505") { // violação de UNIQUE
      res.status(400).json({ error: "Email ou username já existe" });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// ----------------- LOGIN -----------------
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0)
      return res.status(400).json({ error: "Usuário não encontrado" });

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) return res.status(400).json({ error: "Senha incorreta" });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ message: "Login realizado com sucesso", token, username: user.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------- SOCKET.IO (CHAT EM TEMPO REAL) -----------------
io.on("connection", (socket) => {
  console.log("Usuário conectado:", socket.id);

  // Recebe mensagem do frontend e envia para todos
  socket.on("send_message", (msg) => {
    io.emit("receive_message", msg);
  });

  socket.on("disconnect", () => {
    console.log("Usuário desconectado:", socket.id);
  });
});

// ----------------- INICIAR SERVIDOR -----------------
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

