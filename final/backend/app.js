const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');

/* The main api router is in `routes/api.js' */

const apiRouter = require('./routes/api');

require('dotenv').config();

/* Setup the mongodb database. */
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useFindAndModify', false);
const db = mongoose.connection;
db.on('error', () => console.error('Mongodb connection error'));
db.once('open', () => console.log('Mongodb connected'));

/* Setup the express server */

const app = express();
const httpServer = http.createServer(app);
const io = socketio(httpServer, {
    cors: {
        origin: '*',
        credentials: true
    }
});

/*
 * The cors middleware is used for development testing purpose
 * In the production environment, the frontend and backend both use the same origin
 */

app.use(cors({
    origin: true,
    credentials: true
}));

app.use(bodyParser.json());
app.use(cookieParser());
app.use('/api', apiRouter);
app.set('socketio', io);

/*
 * The following middleware prevents the server from sending back overly detailed error message
 * when receiving malformed json request.
 */

app.use((err, req, res, next) => {
    if (err) {
        res.status(400).send({
            status: 'failed',
            reason: err.message
        });
    }
    else {
        next();
    }
});

const port = process.env.PORT;
httpServer.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
})
