const express = require('express');
const http = require('http');
// Further imports (cors, helmet, morgan, routes, etc.) will be added later

const app = express();
const PORT = process.env.PORT || 8080;

// Basic middleware (more to be added)
// app.use(cors());
// app.use(helmet());
// app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the backend API.' });
});

// TODO: Add application routes here (e.g., app.use('/api/v1', apiRoutesV1);)

// Global error handler (to be implemented)
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send('Something broke!');
// });

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(\`Server is running on port \${PORT}\`);
});

module.exports = app; // For testing purposes
