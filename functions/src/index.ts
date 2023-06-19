import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import axios from "axios";

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.PROJECT_ID,
    clientEmail: process.env.CLIENT_EMAIL,
    privateKey: process.env.PRIVATE_KEY,
  }),
});

export const slackAuth = functions.https.onRequest(async (request, response) => {
  try {
    const data = await connect(request.query.code as string);
    const userInfo = await fetchUserInfo(data.access_token);
    const userId = userInfo.sub;

    const customToken = await admin.auth().createCustomToken(userId);

    const url = new URL("http://localhost:3000");
    url.search = `t=${customToken}`;
    response.redirect(303, url.toString());
    return;
  } catch (e) {
    console.error("Failed to create custom token:", e);
  }
});


const connect = async (code: string) => {
  const client = axios.create({
    baseURL: "https://slack.com/api",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  const res = await client.post("/openid.connect.token", {
    client_id: process.env.SLACK_CLIENT_ID,
    client_secret: process.env.SLACK_CLIENT_SECRET,
    code,
  });
  return res.data;
};

const fetchUserInfo = async (accessToken: string) => {
  const client = axios.create({
    baseURL: "https://slack.com/api",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Bearer ${accessToken}`,
    },
  });
  const res = await client.get("/openid.connect.userInfo");
  return res.data;
};
