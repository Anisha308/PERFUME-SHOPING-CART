const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  description: {
    type: String,
  },
  images: {
    type: Array,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'category',
  },
  price: {
    type: Number,
  },
  is_listed: {
    type: Boolean,

  }
})

module.exports = mongoose.model('Product', productSchema);