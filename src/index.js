const _ = require("lodash");
const path = require("node:path");
const express = require("express");
const hubspot = require("@hubspot/api-client");
const bodyParser = require("body-parser");
require("./config");

const { checkEnv, isAuthorized, isTokenExpired, logResponse } = require("./helpers");
const { CLIENT_ID, CLIENT_SECRET, PORT, OBJECTS_LIMIT, SCOPES, REDIRECT_URI, GRANT_TYPES } = require("./constants");

let tokenStore = {};

const prepareContactsContent = contacts => {
    return _.map(contacts, contact => {
        const companyName = _.get(contact, "properties.company") || "";
        const name = getFullName(contact.properties);
        return { id: contact.id, name, companyName };
    });
};

const getFullName = contactProperties => {
    const firstName = _.get(contactProperties, "firstname") || "";
    const lastName = _.get(contactProperties, "lastname") || "";
    return `${firstName} ${lastName}`;
};

const refreshToken = async () => {
    const result = await hubspotClient.oauth.tokensApi.create(
        GRANT_TYPES.REFRESH_TOKEN,
        undefined,
        undefined,
        CLIENT_ID,
        CLIENT_SECRET,
        tokenStore.refreshToken,
    );
    tokenStore = result;
    tokenStore.updatedAt = Date.now();
    console.log("Updated tokens", tokenStore);

    hubspotClient.setAccessToken(tokenStore.accessToken);
};

const app = express();

const hubspotClient = new hubspot.Client();

app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(
    bodyParser.urlencoded({
        limit: "50mb",
        extended: true,
    }),
);

app.use(
    bodyParser.json({
        limit: "50mb",
        extended: true,
    }),
);

app.use(checkEnv);

app.get("/", async (_req, res) => {
    try {
        if (!isAuthorized(tokenStore)) return res.redirect("/login");
        if (isTokenExpired(tokenStore)) await refreshToken();

        const properties = ["firstname", "lastname", "company"];

        // Get first contacts page
        // GET /crm/v3/objects/contacts
        // https://developers.hubspot.com/docs/api/crm/contacts
        console.log("Calling crm.contacts.basicApi.getPage. Retrieve contacts.");
        const contactsResponse = await hubspotClient.crm.contacts.basicApi.getPage(OBJECTS_LIMIT, undefined, properties);
        logResponse("Response from API", contactsResponse);

        res.render("contacts", {
            tokenStore,
            contacts: prepareContactsContent(contactsResponse.results),
        });
    } catch (e) {
        handleError(e, res);
    }
});

app.use("/oauth", async (_req, res) => {
    // Use the client to get authorization Url
    // https://www.npmjs.com/package/@hubspot/api-client#obtain-your-authorization-url
    console.log("Creating authorization Url");
    const authorizationUrl = hubspotClient.oauth.getAuthorizationUrl(CLIENT_ID, REDIRECT_URI, SCOPES);
    console.log("Authorization Url", authorizationUrl);

    res.redirect(authorizationUrl);
});

app.use("/oauth-callback", async (req, res) => {
    const code = _.get(req, "query.code");

    // Create OAuth 2.0 Access Token and Refresh Tokens
    // POST /oauth/v1/token
    // https://developers.hubspot.com/docs/api/working-with-oauth
    console.log("Retrieving access token by code:", code);
    const getTokensResponse = await hubspotClient.oauth.tokensApi.create(
        GRANT_TYPES.AUTHORIZATION_CODE,
        code,
        REDIRECT_URI,
        CLIENT_ID,
        CLIENT_SECRET,
    );
    logResponse("Retrieving access token result:", getTokensResponse);

    tokenStore = getTokensResponse;
    tokenStore.updatedAt = Date.now();

    // Set token for the
    // https://www.npmjs.com/package/@hubspot/api-client
    hubspotClient.setAccessToken(tokenStore.accessToken);
    res.redirect("/");
});

app.get("/login", (_req, res) => {
    tokenStore = {};
    res.render("login", { redirectUri: REDIRECT_URI });
});

app.get("/refresh", async (_req, res) => {
    try {
        if (isAuthorized(tokenStore)) await refreshToken();
        res.redirect("/");
    } catch (e) {
        handleError(e, res);
    }
});

app.get("/error", (req, res) => {
    res.render("error", { error: req.query.msg });
});

app.use((error, _req, res) => {
    res.render("error", { error: error.message });
});

app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));
