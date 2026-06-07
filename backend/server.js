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

mongoose.connect('mongodb://localhost:27017/educonnect')
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(3000, () => {
      console.log('Server is running on port 3000');
    });
  })
  .catch((error) => {
    console.log('Error connecting to MongoDB:', error.message);
  });