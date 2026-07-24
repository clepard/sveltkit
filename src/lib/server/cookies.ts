import type { Cookies } from '@sveltejs/kit';

export function applySetCookies(headers: Headers, cookies: Cookies) {
	const values = typeof headers.getSetCookie === 'function' ? headers.getSetCookie() : [headers.get('set-cookie')].filter(Boolean) as string[];
	for (const value of values) {
		const parts = value.split(';').map((part) => part.trim());
		const separator = parts[0].indexOf('=');
		if (separator < 1) continue;
		const name = parts[0].slice(0, separator);
		const cookieValue = parts[0].slice(separator + 1);
		const lower = parts.map((part) => part.toLowerCase());
		const pathPart = parts.find((part) => part.toLowerCase().startsWith('path='));
		const maxAgePart = parts.find((part) => part.toLowerCase().startsWith('max-age='));
		cookies.set(name, cookieValue, {
			path: pathPart?.slice(5) || '/', httpOnly: lower.includes('httponly'), secure: lower.includes('secure'),
			sameSite: lower.includes('samesite=strict') ? 'strict' : lower.includes('samesite=none') ? 'none' : 'lax',
			maxAge: maxAgePart ? Number(maxAgePart.slice(8)) : undefined,
			// Better Auth already percent-encodes the signed token.
			encode: (token) => token
		});
	}
}
