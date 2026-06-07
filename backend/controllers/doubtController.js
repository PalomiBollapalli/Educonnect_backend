import Doubt from '../models/doubt.js';

export const createDoubt = async (req, res) => {
  try {
    const { title, question, userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'User information is required.' });
    }

    const doubt = await Doubt.create({
      title,
      question,
      postedBy: userId
    });
    res.status(201).json(doubt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllDoubts = async (req, res) => {
  try {
    const doubts = await Doubt.find()
      .populate('postedBy', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json(doubts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDoubtById = async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id).populate('postedBy', 'name');
    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found.' });
    }
    res.status(200).json(doubt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDoubt = async (req, res) => {
  try {
    const doubt = await Doubt.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found.' });
    }
    res.status(200).json(doubt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const clarifyDoubt = async (req, res) => {
  try {
    const { userId, name, message } = req.body;
    if (!userId || !message) {
      return res.status(400).json({ message: 'Clarification details are required.' });
    }

    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found.' });
    }

    doubt.clarifications.push({ user: userId, name, message });
    await doubt.save();
    res.status(200).json(doubt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resolveDoubt = async (req, res) => {
  try {
    const { userId, resolved } = req.body;
    if (!userId || typeof resolved !== 'boolean') {
      return res.status(400).json({ message: 'User and resolve status are required.' });
    }

    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found.' });
    }

    if (doubt.postedBy.toString() !== userId) {
      return res.status(403).json({ message: 'Only the owner can mark this doubt as resolved.' });
    }

    doubt.resolved = resolved;
    await doubt.save();
    res.status(200).json(doubt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteDoubt = async (req, res) => {
  try {
    const userId = req.query.userId || req.body.userId;
    if (!userId) {
      return res.status(400).json({ message: 'User information is required.' });
    }

    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found.' });
    }

    if (doubt.postedBy.toString() !== userId) {
      return res.status(403).json({ message: 'You can only delete your own doubt.' });
    }

    await doubt.deleteOne();
    res.status(200).json({ message: 'Doubt Deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};