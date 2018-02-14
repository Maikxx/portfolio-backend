import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as mongoose from 'mongoose';

import { listen } from './utils/listen';

import imageRoutes from './routes/images';

console.log('Aloha! (Re)starting...');

// This creates the server, via the http package.
const startup = async () => {
    // If there is an environment variable for the port, to run this on, use that, else use 3000.
    const port = process.env.PORT || '3000';

    // tslint:disable-next-line:ter-max-len
    const connectionLink = `mongodb://${process.env.MONGO_ATLAS_NAME}:${process.env.MONGO_ATLAS_PW}@cluster0-shard-00-00-ipoy6.mongodb.net:27017,cluster0-shard-00-01-ipoy6.mongodb.net:27017,cluster0-shard-00-02-ipoy6.mongodb.net:27017/maikel?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin`;

    mongoose.connect(connectionLink);

    const app = express();

    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

        if (req.method === 'OPTIONS') {
            res.header('Acces-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
            return res.status(200).json({});
        }
        next();
    });

    app.use('/api/images', imageRoutes);

    app.use((req, res, next) => {
        const error = new Error('Route not found!');
        error.name = 'RouteError';
        next(error);
    });

    app.use((error, req, res, next) => {
        res.status(error.status || 500);
        res.json({
            error: {
                message: error.message,
            },
        });
    });

    await listen(app, {
        port: parseInt(port, 10),
    });
};

startup()
    .then(() => {
        const baseUrl = `http://localhost:3000`;
        console.log(`API Endpoint: ${baseUrl}/api/`);
    })
    .catch((error) => {
        console.log(error.stack);
    });

// Catches all other errors.
process.on('unhandledRejection', (r) => {
    console.log(r);
});

// Handles ctlr+c events.
process.on('SIGINT', async () => {
    try {
        console.log(' Bye!');
    } catch (err) {
        console.error('You have an error in the SIGINT handler', err.stack);
    }

    process.exit(0);
});
