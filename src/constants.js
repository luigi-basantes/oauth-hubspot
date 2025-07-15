const PORT = process.env.PORT || 3000;
module.exports = {
    PORT,
    OBJECTS_LIMIT: 30,
    SCOPES: "crm.objects.contacts.read",
    REDIRECT_URI: `http://localhost:${PORT}/oauth-callback`,
    CLIENT_ID: process.env.HUBSPOT_CLIENT_ID,
    CLIENT_SECRET: process.env.HUBSPOT_CLIENT_SECRET,
    GRANT_TYPES: {
        AUTHORIZATION_CODE: "authorization_code",
        REFRESH_TOKEN: "refresh_token",
    },
};
