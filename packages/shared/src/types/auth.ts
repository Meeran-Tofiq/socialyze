export interface AuthTokens {
	token: string; // your custom JWT
	access_token: string; // Auth0 access token
}

export interface UserInfo {
	sub: string;
	email: string;
	id: string;
}
