import mongoose from 'mongoose';

const connectMongo = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI non défini dans les variables d\'environnement');
  }
  try {
    await mongoose.connect(uri);
console.log('✅ Connexion MongoDB établie');
  } catch (err) {
    console.error('Erreur connexion MongoDB:', err.message);
    process.exit(1);
  }
};

export default connectMongo;