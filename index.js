const express = require('express');
const openid = require('openid-client');

const app = express();

app.set('view engine', 'jade');

app.get('/', (req, res) => {
  const name = 'guest';

  res.render('index', {
    name
  });
});

app.get('/login', async (req, res) => {
  // Humanode Issuer a.k.a. Identity provider.
  const humanodeIssuer = await openid.Issuer.discover(
    'https://auth.staging.oauth2.humanode.io'
  );

  // Set up the common hackathon client.
  const client = new humanodeIssuer.Client({
    client_id: 'hackathon-participant',
    client_secret: 'q4_GkveX47i3M9wYXSkU5CKn3h',
    redirect_uris: ['http://localhost:3000/callback'],
    response_types: ['code'],
    token_endpoint_auth_method: 'client_secret_post'
  });

  // Save client configuration for later use.
  res.app.set('client', client);
});

app.listen(3000, () => {
  console.log('App listening on port 3000!');
});
