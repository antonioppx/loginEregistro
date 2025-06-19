import mysql from 'mysql2';

export const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Root@123',
  database: 'loginfuncional'
});

db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao MySQL:', err);
    return;
  }
  console.log('Conectado ao MySQL!');
});

export function dbInit() {
  db.query(`CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    confirmed TINYINT DEFAULT 0,
    confirmation_code VARCHAR(16)
  )`, (err) => {
    if (err) console.error('Erro ao criar tabela:', err);
  });
  // Adicionar coluna username se não existir (para bancos já criados)
  db.query("ALTER TABLE users ADD COLUMN username VARCHAR(100) NOT NULL DEFAULT ''", (err) => {
    if (err && !err.message.includes('Duplicate')) {
      // Ignora erro se a coluna já existe
      console.error('Erro ao adicionar coluna username:', err);
    }
  });
}