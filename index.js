const express = require('express');
const openid = require('openid-client');
const cookieParser = require('cookie-parser');

const app = express();

app.set('view engine', 'jade');
app.use(cookieParser());

app.get('/', (req, res) => {
  const name = req.cookies.jwtSet ? 'user' : 'guest';

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

  // Set up codeVerifier and save it as a cookie for later use.
  const codeVerifier = openid.generators.codeVerifier(64);
  res.cookie('codeVerifier', codeVerifier, { maxAge: 360000 });

  // Set up codeChallenge for login flow.
  const codeChallenge = openid.generators.codeChallenge(codeVerifier);

  // Get the redirect URI.
  const redirectUri = client.authorizationUrl({
    scope: 'openid',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state: 'some-state'
  });

  // Redirect end-user to Humanode login page.
  // After the login flow user will be redirected to our callback URI.
  res.redirect(redirectUri);
});

app.get('/callback', async (req, res) => {
  // Get codeVerifier and client.
  const { codeVerifier } = req.cookies;
  const client = res.app.get('client');

  // Get callback params with auth code.
  const params = client.callbackParams(req);

  // Exchange auth code for JWT token.
  const tokenSet = await client.callback('http://localhost:3000/callback', params, { state: 'some-state', code_verifier: codeVerifier });
  // Save JWT.
  res.cookie('jwtSet', tokenSet, { maxAge: 360000 });
  // Redirect end-user to root route.
  res.redirect('/');
});

app.listen(3000, () => {
  console.log('App listening on port 3000!');
});
