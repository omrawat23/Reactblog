const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const PostSchema = new Schema({
  userId: { type: String, required: true },  // User ID associated with the post
  title: { type: String, required: true },   // Title of the post
  summary: { type: String, required: true }, // Summary of the post
  content: { type: String, required: true }, // Main content of the post
  cover: { type: String },                    // Cover image URL
  author: { type: String, required: true },  // Author's UID
  email: { type: String, required: true },
}, {
  timestamps: true,                          // Automatically manages createdAt and updatedAt fields
});

const PostModel = model('Post', PostSchema);

module.exports = PostModel;
