var isCookieSecure = process.env.COOKIE_IS_SECURE || 'true';

module.exports = {
    gatekeeper: {
        defaultRights: {
            anonymous: {
                download: process.env.ANONYMOUS_ACCESS_DOWNLOAD || 'false',
                upload: process.env.ANONYMOUS_ACCESS_UPLOAD || 'false',
                delete: process.env.ANONYMOUS_ACCESS_DELETE || 'false'
            },
            authenticated: {
                download: process.env.AUTHENTICATED_ACCESS_DOWNLOAD || 'true',
                upload: process.env.AUTHENTICATED_ACCESS_UPLOAD || 'false',
                delete: process.env.AUTHENTICATED_ACCESS_DELETE || 'false'
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
                isSecure: isCookieSecure
            }
        }, {
            displayName: 'Google',
            routeName: 'google',
            bellProvider: {
                provider: 'google',
                password: process.env.COOKIE_ENCRYPTION_PASSWORD,
                clientId: process.env.GOOGLE_APP_ID,
                clientSecret: process.env.GOOGLE_APP_SECRET,
                isSecure: isCookieSecure
            }
        }, {
            displayName: 'Github',
            routeName: 'github',
            bellProvider: {
                provider: 'github',
                password: process.env.COOKIE_ENCRYPTION_PASSWORD,
                clientId: process.env.GITHUB_APP_ID,
                clientSecret: process.env.GITHUB_APP_SECRET,
                isSecure: isCookieSecure
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
                config: {
                    uri: process.env.PHAB_APP_URI
                }
            },
            additionalRights: {
                download: 'true',
                upload: 'true',
                delete: 'true'
            }
        }]
    }
};