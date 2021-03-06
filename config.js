var fs = require('fs');

var isCookieSecure = process.env.COOKIE_IS_SECURE || 'true';

var keyFile = null;
if (process.env.SERVER_TLS_KEY_FILE) {
    keyFile = fs.readFileSync(process.env.SERVER_TLS_KEY_FILE);
}

var certFile = null;
if (process.env.SERVER_TLS_CERT_FILE) {
    certFile = fs.readFileSync(process.env.SERVER_TLS_CERT_FILE);
}

var chainFile = null;
if (process.env.SERVER_TLS_CHAIN_FILE) {
    chainFile = fs.readFileSync(process.env.SERVER_TLS_CHAIN_FILE);
}

module.exports = {
    githubToken: process.env.GITHUB_TOKEN,
    tls: {
        key: keyFile,
        cert: certFile,
        ca: chainFile
    },
    clapper: {
        defaultRights: {
            anonymous: {
                download: process.env.ANONYMOUS_ACCESS_DOWNLOAD || 'false',
                upload: process.env.ANONYMOUS_ACCESS_UPLOAD || 'false',
                delete: process.env.ANONYMOUS_ACCESS_DELETE || 'false',
                webhooks: process.env.ANONYMOUS_ACCESS_WEBHOOKS || 'false'
            },
            authenticated: {
                download: process.env.AUTHENTICATED_ACCESS_DOWNLOAD || 'false',
                upload: process.env.AUTHENTICATED_ACCESS_UPLOAD || 'false',
                delete: process.env.AUTHENTICATED_ACCESS_DELETE || 'false',
                webhooks: process.env.AUTHENTICATED_ACCESS_WEBHOOKS || 'false'
            }
        },
        cookie: {
            password: process.env.COOKIE_ENCRYPTION_PASSWORD,
            isSecure: isCookieSecure,
            ttl: process.env.COOKIE_TTL
        },
        logins: [{
            displayName: 'Facebook',
            routeName: 'facebook',
            bellProvider: {
                provider: 'facebook',
                password: process.env.COOKIE_ENCRYPTION_PASSWORD,
                clientId: process.env.FACEBOOK_APP_ID,
                clientSecret: process.env.FACEBOOK_APP_SECRET,
                isSecure: isCookieSecure,
                forceHttps: isCookieSecure
            }
        }, {
            displayName: 'Google',
            routeName: 'google',
            bellProvider: {
                provider: 'google',
                password: process.env.COOKIE_ENCRYPTION_PASSWORD,
                clientId: process.env.GOOGLE_APP_ID,
                clientSecret: process.env.GOOGLE_APP_SECRET,
                isSecure: isCookieSecure,
                forceHttps: isCookieSecure
            }
        }, {
            displayName: 'Github',
            routeName: 'github',
            bellProvider: {
                provider: 'github',
                password: process.env.COOKIE_ENCRYPTION_PASSWORD,
                clientId: process.env.GITHUB_APP_ID,
                clientSecret: process.env.GITHUB_APP_SECRET,
                isSecure: isCookieSecure,
                forceHttps: isCookieSecure
            }
        }, {
            displayName: 'Twitter',
            routeName: 'twitter',
            bellProvider: {
                provider: 'twitter',
                password: process.env.COOKIE_ENCRYPTION_PASSWORD,
                clientId: process.env.TWITTER_APP_ID,
                clientSecret: process.env.TWITTER_APP_SECRET,
                isSecure: isCookieSecure,
                forceHttps: isCookieSecure
            }
        }, {
            displayName: process.env.PHAB_DISPLAY_NAME || 'Phabricator',
            routeName: 'phabricator',
            bellProvider: {
                provider: 'phabricator',
                password: process.env.COOKIE_ENCRYPTION_PASSWORD,
                clientId: process.env.PHAB_APP_ID,
                clientSecret: process.env.PHAB_APP_SECRET,
                isSecure: isCookieSecure,
                forceHttps: isCookieSecure,
                config: {
                    uri: process.env.PHAB_APP_URI
                }
            },
            additionalRights: {
                download: 'true',
                upload: 'true'
            },
            plugins: [{
                register: require('./plugins/clapper/providers/phabricatorRoles'),
                options: [{
                    roleName: 'admin',
                    accessRights: {
                        delete: 'false',
                        webhooks: 'true'
                    }
                }]
            }]
        }]
    }
};
