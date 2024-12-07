import './config';
import express from 'express';
import { clearSpam } from './imap';

// const app = express()
// const port = process.env.PORT || 4000;

(async () => {
    await clearSpam()
})();

// app.get('/', async (req, res) => {
//     // const { emails, removed } = await clearSpam();

//     res.send({
//         message: [
//             // `Removing (${removed.length}/${emails.length}) emails...`,
//         ],
//     })
// })

// app.listen(port, () => {
//     console.log(`App listening on port ${port}`)
// });
