export default async function getManagementToken() {
	const res = await fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			grant_type: "client_credentials",
			client_id: process.env.AUTH0_MGMT_CLIENT_ID,
			client_secret: process.env.AUTH0_MGMT_CLIENT_SECRET,
			audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
		}),
	});

	const data = await res.json();

	if (!res.ok) {
		throw new Error(`Failed to get management token: ${JSON.stringify(data)}`);
	}

	return data.access_token;
}
