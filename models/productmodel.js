const mongoose = require('mongoose');
const { TrustProductsEntityAssignmentsContextImpl } = require('twilio/lib/rest/trusthub/v1/trustProducts/trustProductsEntityAssignments');

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
  quantity: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
  },
  is_listed: {
    type: Boolean,
    default:true
  }
})

module.exports = mongoose.model('Product', productSchema);