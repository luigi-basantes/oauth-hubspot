const _ = require("lodash");
const { CLIENT_ID, CLIENT_SECRET } = require("./constants");

const checkEnv = (req, res, next) => {
    if (_.startsWith(req.url, "/error")) return next();

    if (_.isNil(CLIENT_ID)) return res.redirect("/error?msg=Please set HUBSPOT_CLIENT_ID env variable to proceed");
    if (_.isNil(CLIENT_SECRET)) return res.redirect("/error?msg=Please set HUBSPOT_CLIENT_SECRET env variable to proceed");

    next();
};

const isAuthorized = tokenStore => {
    return !_.isEmpty(tokenStore.refreshToken);
};

const isTokenExpired = tokenStore => {
    return Date.now() >= tokenStore.updatedAt + tokenStore.expiresIn * 1000;
};

const logResponse = (message, data) => {
    console.log(message, JSON.stringify(data, null, 1));
};

const handleError = (e, res) => {
    if (_.isEqual(e.message, "HTTP request failed")) {
        const errorMessage = JSON.stringify(e, null, 2);
        console.error(errorMessage);
        return res.redirect(`/error?msg=${errorMessage}`);
    }

    console.error(e);
    res.redirect(`/error?msg=${JSON.stringify(e, Object.getOwnPropertyNames(e), 2)}`);
};

module.exports = {
    checkEnv,
    isAuthorized,
    isTokenExpired,
    logResponse,
    handleError,
};
