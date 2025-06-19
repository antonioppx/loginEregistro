import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { dbInit, db } from './database.js';
import { sendConfirmationEmail } from './mailer.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = 3000;

const JWT_SECRET = 'segredo_super_secreto_123'; // Troque por um segredo forte em produção

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

dbInit();

// Função utilitária para gerar código de confirmação
function gerarCodigoConfirmacao() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Rota de registro
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ error: 'Nome de usuário, e-mail e senha obrigatórios.' });
  const code = gerarCodigoConfirmacao();
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (results && results.length > 0) return res.status(400).json({ error: 'E-mail já cadastrado.' });
    const hash = await bcrypt.hash(password, 10);
    db.query('INSERT INTO users (username, email, password, confirmation_code) VALUES (?, ?, ?, ?)', [username, email, hash, code], async (err, result) => {
      if (err) return res.status(500).json({ error: 'Erro ao registrar.' });
      await sendConfirmationEmail(email, code);
      res.json({ message: 'Registrado! Verifique seu e-mail para confirmar.' });
    });
  });
});

// Rota de confirmação
app.post('/api/confirm', (req, res) => {
  const { email, code } = req.body;
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    const user = results && results[0];
    if (!user) return res.status(400).json({ error: 'Usuário não encontrado.' });
    if (user.confirmed) return res.status(400).json({ error: 'Usuário já confirmado.' });
    if (user.confirmation_code !== code) return res.status(400).json({ error: 'Código inválido.' });
    db.query('UPDATE users SET confirmed = 1 WHERE email = ?', [email], (err) => {
      if (err) return res.status(500).json({ error: 'Erro ao confirmar.' });
      res.json({ message: 'Usuário confirmado com sucesso!' });
    });
  });
});

// Rota de login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    const user = results && results[0];
    if (!user) return res.status(400).json({ error: 'Usuário não encontrado.' });
    if (!user.confirmed) return res.status(400).json({ error: 'Confirme seu e-mail antes de fazer login.' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Senha incorreta.' });
    // Gerar JWT com username
    const token = jwt.sign({ id: user.id, email: user.email, username: user.username }, JWT_SECRET, { expiresIn: '2h' });
    res.json({ message: 'Login realizado com sucesso!', token });
  });
});

// Rota para solicitar recuperação de senha
app.post('/api/recuperar', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'E-mail obrigatório.' });
  const code = gerarCodigoConfirmacao();
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    const user = results && results[0];
    if (!user) return res.status(400).json({ error: 'Usuário não encontrado.' });
    db.query('UPDATE users SET confirmation_code = ? WHERE email = ?', [code, email], async (err) => {
      if (err) return res.status(500).json({ error: 'Erro ao gerar código.' });
      await sendConfirmationEmail(email, code);
      res.json({ message: 'Código de recuperação enviado para o e-mail.' });
    });
  });
});

// Rota para redefinir senha
app.post('/api/redefinir', async (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) return res.status(400).json({ error: 'Preencha todos os campos.' });
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    const user = results && results[0];
    if (!user) return res.status(400).json({ error: 'Usuário não encontrado.' });
    if (user.confirmation_code !== code) return res.status(400).json({ error: 'Código inválido.' });
    const hash = await bcrypt.hash(newPassword, 10);
    db.query('UPDATE users SET password = ?, confirmation_code = NULL WHERE email = ?', [hash, email], (err) => {
      if (err) return res.status(500).json({ error: 'Erro ao redefinir senha.' });
      res.json({ message: 'Senha redefinida com sucesso!' });
    });
  });
});

// Middleware para proteger rotas
function autenticarJWT(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token não fornecido.' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido.' });
    req.user = user;
    next();
  });
}

// Rota protegida de exemplo
app.get('/api/painel', autenticarJWT, (req, res) => {
  res.json({ message: `Bem-vindo ao painel, ${req.user.username}!`, user: req.user });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
}); 