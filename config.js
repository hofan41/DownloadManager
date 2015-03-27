module.exports = {
    login: {
        facebook: {
            clientId: process.env.FACEBOOK_APP_ID,
            clientSecret: process.env.FACEBOOK_APP_SECRET
        },
        google: {
            clientId: process.env.GOOGLE_APP_ID,
            clientSecret: process.env.GOOGLE_APP_SECRET
        },
        github: {
            clientId: process.env.GITHUB_APP_ID,
            clientSecret: process.env.GITHUB_APP_SECRET
        }
    }
};