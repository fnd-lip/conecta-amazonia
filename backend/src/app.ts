import express from 'express';
import routes from './routes';
import cors from 'cors';
import { setupSwagger } from './config/swagger';

const app = express();


app.use(cors());
app.use(express.json());

// Configurar Swagger
setupSwagger(app);

app.use('/uploads', express.static('uploads'));
app.use(routes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!err) return next();
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'Imagem muito grande. Tamanho maximo permitido: 5MB.',
    });
  }
  if (err.code === 'INVALID_FILE_TYPE') {
    return res.status(400).json({ error: err.message });
  }
  if (err.name === 'MulterError') {
    return res.status(400).json({ error: 'Erro ao enviar a imagem.' });
  }
  return res.status(500).json({ error: 'Erro interno do servidor.' });
});

export default app;
