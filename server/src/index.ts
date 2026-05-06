import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { quizRouter } from './routes/quiz';
import { profileRouter } from './routes/profile';
import { matchesRouter } from './routes/matches';
import { messagesRouter } from './routes/messages';
import { reportsRouter } from './routes/reports';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/api/quiz', quizRouter);
app.use('/api/profile', profileRouter);
app.use('/api/matches', matchesRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/reports', reportsRouter);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
