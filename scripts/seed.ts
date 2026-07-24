import { existsSync } from 'node:fs';

if (existsSync('.env')) process.loadEnvFile('.env');

const siteUrl = (process.env.SEED_URL ?? 'http://localhost:5173').replace(/\/$/, '');
const setupToken = process.env.SETUP_TOKEN;
const adminPassword = process.env.ADMIN_PASSWORD;

if (!setupToken || !adminPassword) {
	throw new Error('Set SETUP_TOKEN and ADMIN_PASSWORD before running the seed command');
}
const response = await fetch(`${siteUrl}/admin/setup`, {
	method: 'POST',
	headers: {
		authorization: `Bearer ${setupToken}`,
		'content-type': 'application/json'
	},
	body: JSON.stringify({ password: adminPassword })
});
if (!response.ok) throw new Error(`Setup failed (${response.status}): ${await response.text()}`);
console.log('Created the admin account and starter pages');
