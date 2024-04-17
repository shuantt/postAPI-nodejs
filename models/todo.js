const mongoose = require('mongoose');

//------------------- Mongoose Schema -------------------
const todoSchema = mongoose.Schema(
  {
    title: { type: String, required: [true, 'title 為必填'] },
    completed: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
  },
  { timestamps: true, versionKey: false }
);

const Todo = mongoose.model('Todo', todoSchema);
module.exports = Todo;