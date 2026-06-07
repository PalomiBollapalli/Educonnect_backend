import Note from '../models/note.js';

export const createNote = async (req, res) => {
  try {
    const { title, description, userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'User information is required.' });
    }

    const note = await Note.create({
      title,
      description,
      uploadedBy: userId
    });

    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllNotes = async (req, res) => {
  try {
    const notes = await Note.find()
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id).populate('uploadedBy', 'name email');
    if (!note) {
      return res.status(404).json({ message: 'Note not found.' });
    }
    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateNote = async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!note) {
      return res.status(404).json({ message: 'Note not found.' });
    }
    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const rateNote = async (req, res) => {
  try {
    const { userId, name, score } = req.body;
    if (!userId || !score) {
      return res.status(400).json({ message: 'Rating details are required.' });
    }

    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found.' });
    }

    if (!note.uploadedBy) {
      return res.status(400).json({ message: 'Note owner information is unavailable.' });
    }

    if (note.uploadedBy.toString() === userId) {
      return res.status(400).json({ message: 'You cannot rate your own note.' });
    }

    const existingRating = note.ratings.find((rating) => rating.user?.toString() === userId);
    if (existingRating) {
      existingRating.score = score;
    } else {
      note.ratings.push({ user: userId, name, score });
    }

    await note.save();
    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const reviewNote = async (req, res) => {
  try {
    const { userId, name, comment } = req.body;
    if (!userId || !comment) {
      return res.status(400).json({ message: 'Review details are required.' });
    }

    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found.' });
    }

    if (!note.uploadedBy) {
      return res.status(400).json({ message: 'Note owner information is unavailable.' });
    }

    if (note.uploadedBy.toString() === userId) {
      return res.status(400).json({ message: 'You cannot review your own note.' });
    }

    const existingReview = note.reviews.find((review) => review.user?.toString() === userId);
    if (existingReview) {
      existingReview.comment = comment;
      existingReview.createdAt = new Date();
    } else {
      note.reviews.push({ user: userId, name, comment });
    }

    await note.save();
    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const userId = req.query.userId || req.body.userId;
    if (!userId) {
      return res.status(400).json({ message: 'User information is required.' });
    }

    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found.' });
    }

    if (note.uploadedBy.toString() !== userId) {
      return res.status(403).json({ message: 'You can only delete your own note.' });
    }

    await note.deleteOne();
    res.status(200).json({ message: 'Note Deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};