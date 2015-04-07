module.exports = {
    gatekeeper: {
        accessRights: {
            anonymous: {
                download: process.env.ANONYMOUS_ACCESS_DOWNLOAD,
                upload: process.env.ANONYMOUS_ACCESS_UPLOAD,
                delete: process.env.ANONYMOUS_ACCESS_DELETE
            },
            authenticated: {
                download: process.env.AUTHENTICATED_ACCESS_DOWNLOAD,
                upload: process.env.AUTHENTICATED_ACCESS_UPLOAD,
                delete: process.env.AUTHENTICATED_ACCESS_DELETE
            }
        },
        cookie: {
            password: process.env.COOKIE_ENCRYPTION_PASSWORD,
            isSecure: process.env.COOKIE_IS_SECURE
        },
        logins: [{
            provider: 'facebook',
            clientId: process.env.FACEBOOK_APP_ID,
            clientSecret: process.env.FACEBOOK_APP_SECRET
        }, {
            provider: 'google',
            clientId: process.env.GOOGLE_APP_ID,
            clientSecret: process.env.GOOGLE_APP_SECRET
        }, {
            provider: 'github',
            clientId: process.env.GITHUB_APP_ID,
            clientSecret: process.env.GITHUB_APP_SECRET,
            scope: ['read:org', 'user:email'],
            plugins: [{
                register: require(
                    './plugins/gatekeeper/providers/githubTeams'),
                options: {
                    teams: [{
                        teamId: process.env.GITHUB_TEAM_ID,
                        accessRights: {
                            download: process.env.GITHUB_TEAM_ACCESS_DOWNLOAD,
                            upload: process.env.GITHUB_TEAM_ACCESS_UPLOAD,
                            delete: process.env.GITHUB_TEAM_ACCESS_DELETE
                        }
                    }]
                }
            }]
        }]
    }
};