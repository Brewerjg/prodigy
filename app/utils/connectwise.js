

export function getConnectWiseConfig() {
  const baseUrl = process.env.NEXT_PUBLIC_CONNECTWISE_SITE_URL;
  const clientId = process.env.NEXT_PUBLIC_CONNECTWISE_CLIENT_ID;
  const publicKey = process.env.NEXT_PUBLIC_CONNECTWISE_PUBLIC_KEY;
  const privateKey = process.env.NEXT_PUBLIC_CONNECTWISE_PRIVATE_KEY;
  const companyId = process.env.NEXT_PUBLIC_CONNECTWISE_COMPANY_ID;

  if (!baseUrl || !clientId || !publicKey || !privateKey || !companyId) {
    throw new Error("Missing one or more required ConnectWise API environment variables.");
  }

  const authString = `${companyId}+${publicKey}:${privateKey}`;
  const base64Auth = Buffer.from(authString).toString('base64');

  const headers = {
    'Authorization': `Basic ${base64Auth}`,
    'clientId': clientId,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
  };

  return { baseUrl, headers };
}
