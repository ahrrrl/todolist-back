import express from 'express';
import Todo from '../models/todo.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const todos = await Todo.find({ userId: req.user.userId });
    res.json(todos);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const newTodo = new Todo({
      text,
      userId: req.user.userId,
    });
    const savedTodo = await newTodo.save();
    res.json(savedTodo);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Server error' });
  }
});

router.patch('/:id', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const todo = await Todo.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.userId,
      },
      { text },
      { new: true }
    );
    if (!todo) {
      return res.status(404).send({ message: 'Todo not found' });
    }
    res.json(todo);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Server error' });
  }
});

router.patch('/:id/toggle', auth, async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });
    if (!todo) {
      return res.status(404).send({ message: 'Todo not found' });
    }
    todo.completed = !todo.completed;
    const updatedTodo = await todo.save();
    res.json(updatedTodo);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const deletedTodo = await Todo.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });
    res.json(deletedTodo);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Server error' });
  }
});

export default router;
