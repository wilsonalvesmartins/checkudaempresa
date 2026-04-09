const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());

// 1. Configuração de Persistência (Volume Docker)
// O Coolify montará um volume nesta pasta para não perdermos dados no deploy
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// 2. Inicialização do Banco de Dados SQLite
const dbPath = path.join(dataDir, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Erro ao abrir o banco de dados:', err);
  else console.log('Conectado ao SQLite local.');
});

// Cria as tabelas se não existirem
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// 3. Rotas da API (Backend)

// Rota para salvar um novo lead
app.post('/api/leads', (req, res) => {
  const leadData = JSON.stringify(req.body);
  const stmt = db.prepare('INSERT INTO leads (data) VALUES (?)');
  
  stmt.run(leadData, function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao salvar no banco.' });
    }
    res.json({ success: true, id: this.lastID });
  });
  stmt.finalize();
});

// Rota para listar leads (Protegida por senha)
app.post('/api/admin/leads', (req, res) => {
  const { password } = req.body;
  
  // A senha solicitada no frontend
  if (password !== '159753') {
    return res.status(401).json({ error: 'Acesso negado. Senha incorreta.' });
  }

  db.all('SELECT * FROM leads ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao buscar dados.' });
    }
    
    // Converte de volta o JSON salvo no banco para enviar ao Frontend
    const leads = rows.map(row => ({
      id: row.id,
      created_at: row.created_at,
      ...JSON.parse(row.data)
    }));
    
    res.json(leads);
  });
});

// 4. Servir o Frontend (React/Vite)
// O Express vai servir os arquivos estáticos gerados pelo build do React
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// 5. Iniciar o Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Dados persistentes sendo salvos em: ${dbPath}`);
});
