import express from 'express';
import cors from 'cors';
import postsRouter from './features/posts/posts.router';

const PORT: number = parseInt(process.env.PORT as string) || 3000;
const app = express();

app.use(cors());


app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
