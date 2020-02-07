const Buffer = require('safe-buffer').Buffer;
const Keygrip = require('keygrip');
const keys = require('../../server/config/keyConfig');
module.exports = user => {
    const sessionObj = {
        passport: {
            user: user._id.toString()
        }
    };
    const session = Buffer.from(JSON.stringify(sessionObj)).toString('base64');
    const keygrip = Keygrip([keys.cookieKey]);
    const sig = keygrip.sign('session=' + session);
    return { session, sig };
};