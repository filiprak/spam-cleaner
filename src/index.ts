import { connect, ImapSimpleOptions, Message } from 'imap-simple';
import { config as loadEnv } from 'dotenv';

loadEnv();

// IMAP Configuration
const config: ImapSimpleOptions = {
    imap: {
        user: process.env.IMAP_USER!,
        password: process.env.IMAP_PASSWORD!,
        host: process.env.IMAP_HOST!,
        port: parseInt(process.env.IMAP_PORT!) || 993,
        tls: process.env.IMAP_TLS === 'true',
        authTimeout: 5000, // Timeout for authentication
    },
};

type Email = {
    subject: string;
    from: string;
    date: string;
    body: string;
};

async function fetchLastEmails(): Promise<void> {
    try {
        // Connect to IMAP server
        const connection = await connect({ imap: config.imap });
        await connection.openBox('INBOX'); // Open INBOX

        // Search for all emails
        const searchCriteria = ['ALL'];
        const fetchOptions = {
            bodies: ['HEADER', 'TEXT'],
            markSeen: false,
        };

        const messages: Message[] = await connection.search(searchCriteria, fetchOptions);

        // Extract the last three emails
        const lastThreeEmails: Email[] = messages.slice(-3).map((email) => {
            const header = email.parts.find((part) => part.which === 'HEADER');
            const body = email.parts.find((part) => part.which === 'TEXT');
            return {
                subject: header?.body.subject[0] || 'No Subject',
                from: header?.body.from[0] || 'Unknown Sender',
                date: header?.body.date[0] || 'Unknown Date',
                body: body?.body || 'No Body Content',
            };
        });

        // Output last three emails
        console.log('Last 3 Emails:', lastThreeEmails);

        // Close the connection
        connection.end();
    } catch (error) {
        console.error('Error fetching emails:', (error as Error).message);
    }
}

fetchLastEmails();
