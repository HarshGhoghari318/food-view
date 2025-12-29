const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    video: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    foodPartnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "foodPartner"
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: String,
        createdAt: { type: Date, default: Date.now },
      }
    ],

    shares: { type: Number, default: 0 }
}, { timestamps: true });


module.exports = mongoose.model('food', foodSchema);

