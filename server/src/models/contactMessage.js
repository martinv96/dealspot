import mongoose from 'mongoose';

const ContactMessageSchema = new mongoose.Schema({
  email: { type: String, required: true },
  sujet: { type: String, required: true },
  message: { type: String, required: true },
  categorie: { type: String, default: 'général' },
  status: { type: String, default: 'nouveau' },
  createdAt: { type: Date, default: Date.now },
  meta: { type: Object, default: {} }
});

export default mongoose.model('ContactMessage', ContactMessageSchema);