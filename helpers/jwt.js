const { expressjwt: expressJwt } = require('express-jwt');
const api = process.env.API_URL;

function authJWT() {
  const secret = process.env.secret;
  return expressJwt({
    secret,
    algorithms: ['HS256'],
    isRevoked: isRevoked,
  }).unless({
    path: [
      { url: /\/api\/v1\/products(.*)/, methods: ['GET', 'OPTIONS'] },
      { url: /\/api\/v1\/categories(.*)/, methods: ['GET', 'OPTIONS'] },
      { url: /\/public\/uploads(.*)/, methods: ['GET', 'OPTIONS'] },

      `${api}/users/login`,
      `${api}/users/register`,

    ],
  });
}

async function isRevoked(req, payload) {
  return payload.isAdmin;
}
module.exports = authJWT;
