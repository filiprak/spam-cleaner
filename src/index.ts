import './config';
import express from 'express';
import { clearSpam } from './imap';

const app = express()
const port = process.env.PORT || 8080;

app.get('/', async (req, res) => {
    const { emails, removed } = await clearSpam();

    res.send({
        message: [
            `Filtered (${removed.length}/${emails.length}) emails from inbox...`,
        ],
    })
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
});
