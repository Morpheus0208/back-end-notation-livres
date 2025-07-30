const express = require('express');
const mongoose = require('mongoose');

mongoose
  .connect(
    'mongodb+srv://morpheus0208code:2eLMCAUlGWlp1Q9o@cluster0-openclassroom.utu2xsj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0-openclassroom',
    {}
  )
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.post('/api/book', (req, res, next) => {
  console.log(req.body);
  res.status(201).json({
    message: 'Livre créé !',
  });
  next();
});

app.get('/api/book', (req, res) => {
  const book = [
    {
      _userid: 'oeihfzeoi',
      title: 'Mon premier livre',
      author: 'john Doe',
      imageUrl: 'https://cdn.pixabay.com/photo/2019/06/11/18/56/camera-4267692_1280.jpg',
      year: 2025,
      genre: 'Science Fiction',
      rating: [
        {
          userId: 'qsomihvqios',
          rating: 4,
        },
      ],
    },
    {
      _userid: 'oeihfzeomoihi',
      title: 'Mon deuxième livre',
      author: 'jane Doe',
      imageUrl: 'https://cdn.pixabay.com/photo/2019/06/11/18/56/camera-4267692_1280.jpg',
      year: 2025,
      genre: 'biographie',
      rating: [
        {
          userId: 'oeihfzeomoihi',
          rating: 1,
        },
      ],
    },
  ];
  res.status(200).json(book);
});

module.exports = app;
