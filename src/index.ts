import './config';
import path from 'path';
import express from 'express';
import { fork } from 'child_process';

const app = express()
const port = process.env.PORT || 8080;
const worker_path = path.resolve(__dirname, 'worker.js');

app.get('/', async (req, res) => {
    fork(worker_path);

    res.send({
        message: `Started cleaner worker...`,
    })
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
});
