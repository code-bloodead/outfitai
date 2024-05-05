const mongoose = require("mongoose");

const CustomImage = new mongoose.Schema({
  product_id: {
    type: String,
  },
  user_id: {
    type: String,
  },
  image: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
});

module.exports = mongoose.model("CustomImage", CustomImage);
