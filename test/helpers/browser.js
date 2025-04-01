import { env } from 'node:process';
import { chromium } from 'playwright';
import withServer from './server.js';

const debugMode = Boolean(env.PWDEBUG);
const options = {
    ...(debugMode && {
        devtools : true,
        slowMo   : 500
    })
};

const withPage = async (t, run) => {
    const browser = await chromium.launch(options);
    const page = await browser.newPage();
    try {
        await withServer(t, (t2, server) => {
            return run(t2, server, page);
        });
    }
    finally {
        await browser.close();
    }
};

export default withPage;
