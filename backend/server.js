import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { registerUser, loginUser } from './controllers/authController.js';
import noteRoutes from './routes/noteRoutes.js';
import doubtRoutes from './routes/doubtRoutes.js';

const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Educonnect backend is running');
});

app.use('/api/notes', noteRoutes);
app.use('/api/doubts', doubtRoutes);

app.post('/api/register', registerUser);
app.post('/api/login', loginUser);

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log('Error connecting to MongoDB:', error.message);
  });
