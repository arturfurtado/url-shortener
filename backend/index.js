const fastify = require('fastify')({ logger: true });
const cors = require('@fastify/cors');
const Database = require('better-sqlite3');

const db = new Database('urls.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS clicks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url_id TEXT NOT NULL,
    clicked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT,
    referrer TEXT,
    user_agent TEXT,
    FOREIGN KEY(url_id) REFERENCES urls(code)
  )
`)

const insertUrl = db.prepare('INSERT INTO urls (code, originalUrl) VALUES (?, ?)');
const findUrl = db.prepare('SELECT originalUrl FROM urls WHERE code = ?');

fastify.register(cors, {
  origin: '*',    
  methods: ['GET', 'POST']
});

fastify.post('/api/shorten', async (request, reply) => {
  const { originalUrl, customSlug } = request.body;
  
  if (!originalUrl) {
    return reply.status(400).send({ error: 'URL inválida.' });
  }

  if (customSlug) {
    const existing = db.prepare('SELECT code FROM urls WHERE code = ?').get(customSlug);
    if (existing) {
      return reply.status(400).send({ error: 'Slug já está em uso.' });
    }
  }

  const code = customSlug || Math.random().toString(36).substr(2, 6);

  try {
    db.prepare('INSERT INTO urls (code, originalUrl) VALUES (?, ?)')
      .run(code, originalUrl);
    
    return { 
      shortUrl: `http://localhost:3001/${code}`,
      isCustom: !!customSlug
    };
  } catch (error) {
    return reply.status(500).send({ error: 'Erro ao salvar URL.' });
  }
});

fastify.get('/:code', async (request, reply) => {
  const { code } = request.params;
  const urlEntry = db.prepare('SELECT * FROM urls WHERE code = ?').get(code);
  
  if (urlEntry) {
    db.prepare(
      'INSERT INTO clicks (url_id, ip_address, referrer, user_agent) VALUES (?, ?, ?, ?)'
    ).run(
      code,
      request.ip,
      request.headers.referer || 'direct',
      request.headers['user-agent']
    );
    
    return reply.redirect(urlEntry.originalUrl);
  }
  return reply.status(404).send('URL não encontrada.');
});

fastify.get('/api/analytics/:code', async (request, reply) => {
  const { code } = request.params;

  const totalClicks = db.prepare(`
    SELECT COUNT(*) as count FROM clicks WHERE url_id = ?
  `).get(code).count;

  const dailyClicks = db.prepare(`
    SELECT DATE(clicked_at) as date, COUNT(*) as count
    FROM clicks
    WHERE url_id = ?
    GROUP BY DATE(clicked_at)
    ORDER BY date
  `).all(code);

  const referrers = db.prepare(`
    SELECT referrer, COUNT(*) as count
    FROM clicks
    WHERE url_id = ?
    GROUP BY referrer
  `).all(code);

  return {
    totalClicks,
    dailyClicks,
    referrers
  };
});

const start = async () => {
  try {
    await fastify.listen({
      port: 3001,
      host: '0.0.0.0' 
    });
    fastify.log.info(`Servidor rodando na porta 3001`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();