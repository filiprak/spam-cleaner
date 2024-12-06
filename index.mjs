import { clearSpam } from './dist/index.js';

export const handler = async (event) => {
    let msg = '';
    try {
        await clearSpam();
        msg = 'OK';
    }
    catch (error) {
        msg = 'Error fetching emails' + error;
    }

    const response = {
        statusCode: 200,
        body: JSON.stringify({
            msg: msg,
        }),
    };
    return response;
};
