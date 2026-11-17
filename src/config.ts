function required(key: string): string {
	const value = process.env[key]?.trim();
	if (!value) throw new Error(`Missing ${key}. Copy .env.example to .env and fill it in.`);
	return value;
}

const optional = (key: string): string | undefined => process.env[key]?.trim() || undefined;

export const config = {
	token: required("DISCORD_TOKEN"),
	appId: required("DISCORD_APP_ID"),
	devGuildId: optional("DEV_GUILD_ID"),
};
