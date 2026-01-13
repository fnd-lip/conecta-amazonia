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

export default app;
