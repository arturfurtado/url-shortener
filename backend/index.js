const fastify = require('fastify')({ logger: true });
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('@fastify/cors');
const SECRET_KEY = 'sua_chave_secreta';

fastify.register(cors, {
  origin: '*'
});

const db = new sqlite3.Database('./database.db', (err) => {
  if (err) console.error('Erro ao abrir o banco:', err);
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS urls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      original_url TEXT,
      shortened_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS clicks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url_id TEXT NOT NULL,
      clicked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      ip_address TEXT,
      referrer TEXT,
      user_agent TEXT,
      FOREIGN KEY(url_id) REFERENCES urls(shortened_url)
    )
  `);
});

fastify.decorate('authenticate', async function (request, reply) {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return reply.code(401).send({ error: 'Token não informado' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, SECRET_KEY);
    request.user = decoded;
  } catch (err) {
    reply.code(401).send({ error: 'Token inválido' });
  }
});

fastify.post('/api/shorten', { preHandler: [fastify.authenticate] }, async (request, reply) => {
  const { originalUrl, customSlug } = request.body;
  if (!originalUrl) {
    return reply.status(400).send({ error: 'URL inválida.' });
  }
  const userId = request.user.id;

  const code = customSlug && customSlug.trim() !== ''
    ? customSlug
    : Math.random().toString(36).substr(2, 6);

  try {
    if (customSlug && customSlug.trim() !== '') {
      const existing = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM urls WHERE shortened_url = ?', [customSlug], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      if (existing) {
        return reply.status(400).send({ error: 'Slug já está em uso.' });
      }
    }
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO urls (user_id, original_url, shortened_url) VALUES (?, ?, ?)',
        [userId, originalUrl, code],
        function (err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    return reply.send({ shortUrl: `http://localhost:3000/${code}`, isCustom: !!customSlug });
  } catch (error) {
    return reply.status(500).send({ error: 'Erro ao salvar URL.' });
  }
});

fastify.get('/:code', async (request, reply) => {
  const { code } = request.params;
  db.get('SELECT * FROM urls WHERE shortened_url = ?', [code], (err, urlEntry) => {
    if (err) {
      return reply.status(500).send({ error: 'Erro ao buscar URL.' });
    }
    if (urlEntry) {
      db.run(
        'INSERT INTO clicks (url_id, ip_address, referrer, user_agent) VALUES (?, ?, ?, ?)',
        [
          code,
          request.ip,
          request.headers.referer || 'direct',
          request.headers['user-agent']
        ],
        (err) => {
          if (err) console.error('Erro ao registrar clique:', err);
        }
      );
      return reply.redirect(urlEntry.original_url);
    }
    return reply.status(404).send('URL não encontrada.');
  });
});

fastify.get('/api/analytics/:code', { preHandler: [fastify.authenticate] }, async (request, reply) => {
  const code = request.params.code;

  try {
    const totalClicks = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM clicks WHERE url_id = ?', [code], (err, row) => {
        if (err) return reject(err);
        resolve(row ? row.count : 0);
      });
    });

    const dailyClicks = await new Promise((resolve, reject) => {
      db.all(
        `SELECT DATE(clicked_at) as date, COUNT(*) as count
         FROM clicks
         WHERE url_id = ?
         GROUP BY DATE(clicked_at)
         ORDER BY date`,
        [code],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        }
      );
    });

    const referrers = await new Promise((resolve, reject) => {
      db.all(
        `SELECT referrer, COUNT(*) as count
         FROM clicks
         WHERE url_id = ?
         GROUP BY referrer`,
        [code],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        }
      );
    });

    return reply.send({ totalClicks, dailyClicks, referrers });
  } catch (error) {
    return reply.status(500).send({ error: 'Erro ao buscar analytics.' });
  }
});

fastify.post('/register', async (request, reply) => {
  const { username, password } = request.body;
  if (!username || !password) {
    return reply.status(400).send({ error: 'Username e password são obrigatórios' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword],
      function(err) {
        if (err) {
          return reply.status(500).send({ error: 'Erro ao criar usuário' });
        }
        reply.send({ message: 'Usuário criado com sucesso', username });
      }
    );
  } catch (err) {
    reply.status(500).send({ error: 'Erro ao criar usuário' });
  }
});

fastify.post('/login', async (request, reply) => {
  const { username, password } = request.body;
  if (!username || !password) {
    return reply.status(400).send({ error: 'Username e password são obrigatórios' });
  }
  try {
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
    if (!user) {
      return reply.status(401).send({ error: 'Credenciais inválidas' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return reply.status(401).send({ error: 'Credenciais inválidas' });
    }
    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
    return reply.send({ token });
  } catch (err) {
    return reply.status(500).send({ error: 'Erro no login' });
  }
});

fastify.get('/urls', { preHandler: [fastify.authenticate] }, async (request, reply) => {
  const userId = request.user.id;
  try {
    const rows = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM urls WHERE user_id = ?', [userId], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
    return reply.send(rows);
  } catch (err) {
    return reply.status(500).send({ error: 'Erro ao buscar URLs' });
  }
});


const start = async () => {
  try {
    await fastify.listen({
      port: 3001,
      host: '0.0.0.0'
    });
    console.log('Servidor rodando na porta 3001');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
