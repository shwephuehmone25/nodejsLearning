const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const postSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image_url: {
    type: String,
    required: true,
  },
  /**Get User idfrom mongo */
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }
});

module.exports = model("Post", postSchema);