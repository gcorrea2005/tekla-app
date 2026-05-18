const { ConfidentialClientApplication } = require('@azure/msal-node');

require('dotenv').config();

const GRAPH_API = 'https://graph.microsoft.com/v1.0';
const SCOPES = ['https://graph.microsoft.com/.default'];

let msalClient = null;
let accessToken = null;
let tokenExpiry = 0;

function getMsalClient() {
  if (msalClient) return msalClient;

  const { AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID } = process.env;
  if (!AZURE_CLIENT_ID || !AZURE_CLIENT_SECRET || !AZURE_TENANT_ID) {
    throw new Error('Missing Azure credentials in .env file');
  }

  msalClient = new ConfidentialClientApplication({
    auth: {
      clientId: AZURE_CLIENT_ID,
      clientSecret: AZURE_CLIENT_SECRET,
      authority: `https://login.microsoftonline.com/${AZURE_TENANT_ID}`,
    },
  });

  return msalClient;
}

async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpiry) return accessToken;

  const client = getMsalClient();
  const result = await client.acquireTokenByClientCredential({ scopes: SCOPES });

  accessToken = result.accessToken;
  tokenExpiry = result.expiresOn.getTime() - 60000; // refresh 1 min early

  return accessToken;
}

async function graphGet(path) {
  const token = await getAccessToken();
  const res = await fetch(`${GRAPH_API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Graph API error ${res.status}: ${body}`);
  }

  return res;
}

async function listIfcFiles() {
  const folderPath = process.env.ONEDRIVE_FOLDER_PATH || 'CDE CTIB/2. Compartido/2. estructura/02.Modelos';
  const encodedPath = encodeURIComponent(folderPath);

  const res = await graphGet(`/me/drive/root:/${encodedPath}:/children`);
  const data = await res.json();

  const files = (data.value || [])
    .filter((item) => item.name && item.name.toLowerCase().endsWith('.ifc'))
    .map((item) => ({
      id: item.id,
      name: item.name,
      size: item.size,
      lastModified: item.lastModifiedDateTime,
      downloadUrl: item['@microsoft.graph.downloadUrl'],
    }));

  return files;
}

async function downloadIfcFile(itemId) {
  // Get item with download URL
  const res = await graphGet(`/me/drive/items/${itemId}?select=id,name,@microsoft.graph.downloadUrl`);
  const item = await res.json();

  if (item['@microsoft.graph.downloadUrl']) {
    // Direct download URL (no auth needed)
    const fileRes = await fetch(item['@microsoft.graph.downloadUrl']);
    return Buffer.from(await fileRes.arrayBuffer());
  }

  // Fallback: download via Graph API with auth
  const fileRes = await graphGet(`/me/drive/items/${itemId}/content`);
  return Buffer.from(await fileRes.arrayBuffer());
}

async function checkConnection() {
  try {
    await getAccessToken();
    return { connected: true };
  } catch (err) {
    return { connected: false, error: err.message };
  }
}

module.exports = { listIfcFiles, downloadIfcFile, checkConnection };
