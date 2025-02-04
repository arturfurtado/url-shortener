const fastify = require('fastify')({ logger: true });
const cors = require('@fastify/cors');
const Database = require('better-sqlite3');

const db = new Database('urls.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS urls (
    code TEXT PRIMARY KEY,
    originalUrl TEXT NOT NULL
  )
`);

const insertUrl = db.prepare('INSERT INTO urls (code, originalUrl) VALUES (?, ?)');
const findUrl = db.prepare('SELECT originalUrl FROM urls WHERE code = ?');

fastify.register(cors, {
  origin: '*', // Ou especifique seus domínios permitidos
  methods: ['GET', 'POST']
});

fastify.post('/api/shorten', async (request, reply) => {
  const { originalUrl } = request.body;
  if (!originalUrl) {
    return reply.status(400).send({ error: 'URL inválida.' });
  }

  const code = Math.random().toString(36).substr(2, 6);
  
  try {
    insertUrl.run(code, originalUrl);
    const shortUrl = `http://localhost:3001/${code}`;
    return { shortUrl };
  } catch (error) {
    return reply.status(500).send({ error: 'Erro ao salvar URL.' });
  }
});

fastify.get('/:code', async (request, reply) => {
  const { code } = request.params;
  const result = findUrl.get(code);
  
  if (result) {
    return reply.redirect(result.originalUrl);
  }
  return reply.status(404).send('URL não encontrada.');
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