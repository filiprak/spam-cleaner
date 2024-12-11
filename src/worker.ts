import { clearSpam } from './imap';

(async () => {
    console.log(`Started worker ${process.pid}`);
    await clearSpam();
    console.log(`Finished worker ${process.pid}`);
})();
