const express = require('express');

const app = express();

app.set('view engine', 'jade');

app.get('/', (req, res) => {
  const name = 'guest';

  res.render('index', {
    name
  });
});

app.listen(3000, () => {
  console.log('App listening on port 3000!');
});
