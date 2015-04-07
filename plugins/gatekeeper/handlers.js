exports.onPreResponse = function(request, reply) {
    // Leave API responses alone
    if (request.route.settings.app.isAPI) {
        return reply.continue();
    }

    var response = request.response;

    if (response.isBoom) {
        var error = response;

        console.log(error);

        var context = {
            supportedProviders: this.internals.supportedProviders,
            error: error.output.payload.error,
            message: error.output.payload.message,
            code: error.output.statusCode
        };

        if (request.auth.isAuthenticated) {
            context.profile = request.auth.credentials.profile;
        }

        context.accessRights = this.server.methods.getUserAccessRights(request);

        return reply.view('error', context).code(error.output
            .statusCode);
    }

    if (response.variety === 'view') {
        var context = response.source.context || {};

        if (request.auth.isAuthenticated) {
            context.profile = request.auth.credentials.profile;
        }

        context.accessRights = this.server.methods.getUserAccessRights(request);

        context.supportedProviders = this.internals.supportedProviders;
    }

    return reply.continue();
};

exports.logOut = function(request, reply) {
    request.auth.session.clear();
    reply.redirect(request.info.referrer);
};