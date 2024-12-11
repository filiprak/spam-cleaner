import './config';
import express from 'express';
import { fork } from 'child_process';

const app = express()
const port = process.env.PORT || 8080;

app.get('/', async (req, res) => {
    fork('./worker.js');

    res.send({
        message: `Started cleaner worker...`,
    })
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
});
