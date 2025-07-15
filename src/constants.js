const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

const REDIRECT_URI = NODE_ENV === "production" ? "https://oauth-hubspot.fly.dev/oauth-callback" : `http://localhost:${PORT}/oauth-callback`;

module.exports = {
    PORT,
    OBJECTS_LIMIT: 30,
    SCOPES: "crm.objects.contacts.read",
    REDIRECT_URI,
    CLIENT_ID: process.env.HUBSPOT_CLIENT_ID,
    CLIENT_SECRET: process.env.HUBSPOT_CLIENT_SECRET,
    GRANT_TYPES: {
        AUTHORIZATION_CODE: "authorization_code",
        REFRESH_TOKEN: "refresh_token",
    },
};
