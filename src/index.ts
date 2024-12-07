import './config';
import express from 'express';
import { clearSpam } from './imap';

const app = express()
const port = process.env.PORT || 8080;

app.get('/', async (req, res) => {
    const { emails, removed } = await clearSpam();

    res.send({
        message: [
            `Removed (${removed.length}/${emails.length}) emails...`,
        ],
    })
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
});
