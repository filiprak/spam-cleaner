import Imap from 'node-imap';

// IMAP Configuration
const imapConfig: Imap.Config = {
    user: process.env.IMAP_USER!,
    password: process.env.IMAP_PASSWORD!,
    host: process.env.IMAP_HOST!,
    port: parseInt(process.env.IMAP_PORT!) || 993,
    tls: process.env.IMAP_TLS === 'true',
    authTimeout: 15000, // Timeout for authentication
    // debug: console.log,
};

type Email = {
    uid?: string,
    subject?: string;
    from?: string;
    date?: string;
    body?: string;
};

const BUFFER = 25;
const BLACKLIST: string[] = [
    'wp@wp.pl'
];

function filterEmails(emails: Email[], from: string[]): Email[] {
    const emailRegex = /<([^>]+)>/;

    return emails.filter(email => {
        const match = email.from?.match(emailRegex);
        const emailAddress = match ? match[1] : null;
        return emailAddress && from.includes(emailAddress);
    });
}

export async function clearSpam() {
    const imap = new Imap(imapConfig);

    const openInbox = (): Promise<Imap.Box> => {
        return new Promise((resolve, reject) => {
            imap.openBox('INBOX', false, (err, box) => {
                if (err) reject(err);
                else resolve(box);
            });
        });
    };

    const fetchEmails = (box: Imap.Box): Promise<Email[]> => {
        return new Promise((resolve, reject) => {
            const fetchOptions = {
                bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE)',
                struct: true,
            };

            console.log('Total: ' + box.messages.total);

            const fetch = imap.seq.fetch((box.messages.total - (BUFFER - 1)) + ':*', fetchOptions);
            const messages: Email[] = [];

            fetch.on('message', (msg) => {
                let email: Email = {};

                msg.on('body', (stream) => {
                    let buffer = '';
                    stream.on('data', (chunk) => {
                        buffer += chunk.toString();
                    });

                    stream.once('end', () => {
                        const parsed = Imap.parseHeader(buffer);
                        email = {
                            subject: parsed.subject ? parsed.subject[0] : 'No Subject',
                            from: parsed.from ? parsed.from[0] : 'Unknown Sender',
                            date: parsed.date ? parsed.date[0] : 'Unknown Date',
                            // body: buffer,
                        };
                    });
                });

                msg.once('attributes', (attrs) => {
                    email.uid = attrs.uid;  // Get the UID from the message attributes
                });

                msg.once('end', () => {
                    if (email) messages.push(email);
                });
            });

            fetch.once('end', () => resolve(messages));
            fetch.once('error', (err) => reject(err));
        });
    };

    const removeEmails = async (emails: Email[]) => {
        await Promise.all(
            emails.map(email => new Promise<void>((resolve, reject) => {
                imap.addFlags(email.uid, ['\\Seen', '\\Deleted'], (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        console.log(`Message with UID ${email.uid} marked for deletion.`);
                        resolve();
                    }
                });
            }))
        );
        // await new Promise<void>((resolve, reject) => {
        //     imap.expunge((err) => {
        //         if (err) {
        //             reject(err);
        //         } else {
        //             console.log(`Messages deleted from the server.`);
        //         }
        //         resolve();
        //     });
        // });
    };

    return new Promise<{ emails: Email[], removed: Email[] }>((resolve, reject) => {
        imap.once('ready', async () => {
            try {
                console.log('Connected to IMAP server');
                const box = await openInbox();

                console.log('Fetching emails...');
                const emails = await fetchEmails(box);
                const to_remove = filterEmails(emails, BLACKLIST);

                console.log(`Removing (${to_remove.length}/${emails.length}) emails...`);
                await removeEmails(to_remove);

                imap.end();
                resolve({
                    emails,
                    removed: to_remove,
                });
            } catch (error) {
                reject(error);
            }
        });

        imap.once('error', (err) => {
            reject(err);
        });

        imap.once('end', () => {
            console.log('Connection ended.');
        });

        imap.connect();
    });
}
