const express = require('express');
const mongoose = require('mongoose');

const app = express();
mongoose
  .connect(
    'mongodb+srv://morpheus0208code:2eLMCAUlGWlp1Q9o@cluster0-openclassroom.utu2xsj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0-openclassroom',
    {}
  )
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(next => {
  console.log('requête reçue ');
  next();
});
app.use((res, next) => {
  res.status(201);
  next();
});
app.use((res, next) => {
  res.json({ message: 'votre requête a été bien reçue !' });
  next();
});
app.use(() => {
  console.log('réponse envoyée avec succès !');
});

module.exports = app;
