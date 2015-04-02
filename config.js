module.exports = {
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
        scope: ['read:org', 'user:email']
    }]
};