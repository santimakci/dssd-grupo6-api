// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

export const configuration = () => ({
  cors: {
    origin: process.env.ALLOWED_ORIGIN,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'X-Access-Token',
      'Authorization',
    ],
    preflightContinue: false,
    optionsSuccessStatus: 200,
    credentials: true,
  },
});
