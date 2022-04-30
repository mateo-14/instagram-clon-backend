import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import authRouter from 'auth/auth.router';
import postsRouter from 'posts/posts.router';
import usersRouter from 'users/users.router';
import commentsRouter from 'comments/comments.router';
import swaggerUi from 'swagger-ui-express';

const PORT: number = parseInt(process.env.PORT as string) || 8080;
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/posts', postsRouter);
app.use('/api/users', usersRouter);
app.use('/api/comments', commentsRouter);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(require('../openapi.json')));
app.use((err: Error, _: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) return next(err);

  console.error(err);
  res.sendStatus(500);
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
