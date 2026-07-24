process.env.ALLOW_SEED_SIGNUP = 'true';

const { auth } = await import('../src/lib/server/auth.ts');
const { db } = await import('../src/lib/server/db/index.ts');
const { pages, user } = await import('../src/lib/server/db/schema.ts');
const { createPageDocument } = await import('../src/lib/server/page-document.ts');
const { eq } = await import('drizzle-orm');

function starterDocument(input: {
	title: string;
	eyebrow: string;
	headline: string;
	intro: string;
	sectionLabel: string;
	sections: Array<{ heading: string; body: string }>;
}) {
	return createPageDocument({
		fields: {
			'site.title': input.title,
			'nav.work': 'Work',
			'nav.about': 'About',
			'hero.eyebrow': input.eyebrow,
			'hero.headline': input.headline,
			'hero.intro': input.intro,
			'hero.cta': 'Explore our work',
			'work.label': input.sectionLabel,
			'footer.brand': 'Northwind Studio',
			'footer.note': 'Independent digital practice · Vilnius'
		},
		surfaces: {
			header: { background: '#f4f1e9', text: '#17211b' },
			hero: { background: '#f4f1e9', text: '#17211b' },
			work: { background: '#f4f1e9', text: '#17211b' },
			footer: { background: '#173b2c', text: '#ffffff' },
			'button.primary': { background: '#173b2c', text: '#ffffff' }
		},
		collections: { beliefs: input.sections },
		accent: '#b64b2b'
	});
}

const existingAdmin = await db.query.user.findFirst({ where: eq(user.id, 'admin') });
if (!existingAdmin) {
	if (process.env.NODE_ENV === 'production' && process.env.ALLOW_INSECURE_ADMIN !== 'true') {
		throw new Error('Refusing to seed admin/admin in production. Set a real admin through a secure provisioning flow, or explicitly set ALLOW_INSECURE_ADMIN=true for disposable testing only.');
	}
	await auth.api.signUpEmail({ body: { name: 'Administrator', email: 'admin@local.invalid', password: 'admin' } });
	console.log('Created test account: admin / admin');
}

const existingPage = await db.query.pages.findFirst({ where: eq(pages.slug, 'home') });
if (!existingPage) {
	const now = new Date();
	const content = starterDocument({
		title: 'Northwind Studio',
		eyebrow: 'Independent creative studio',
		headline: 'Ideas that move at the speed of culture.',
		intro: 'We partner with ambitious teams to shape identities, digital products, and stories that remain useful long after launch.',
		sectionLabel: 'What we believe',
		sections: [
			{ heading: 'Make it clear', body: 'Strategy and design should remove friction. We turn complicated ideas into focused, memorable experiences.' },
			{ heading: 'Build for change', body: 'Flexible systems help brands evolve without losing what makes them recognizable and trusted.' },
			{ heading: 'Stay curious', body: 'The strongest work comes from testing assumptions, learning quickly, and making room for unexpected answers.' }
		]
	});
	await db.insert(pages).values({ id: crypto.randomUUID(), slug: 'home', title: 'Northwind Studio', draftContent: content, publishedContent: content, draftUpdatedAt: now, publishedAt: now, updatedBy: 'admin' });
	console.log('Created and published the dummy homepage');
}

const starterPages = [
	{
		slug: 'work', title: 'Our Work · Northwind Studio', eyebrow: 'Selected work', headline: 'Useful ideas, made beautifully.',
		intro: 'A selection of identity, product, and digital projects created with teams who care about lasting impact.',
		sectionLabel: 'Recent collaborations',
		sections: [
			{ heading: 'Field Notes', body: 'A flexible publishing platform designed around clarity, rhythm, and thoughtful discovery.' },
			{ heading: 'Common Ground', body: 'A new identity and digital home for a community building more welcoming public spaces.' },
			{ heading: 'Afterlight', body: 'Product strategy and interaction design for a calmer way to organize creative work.' }
		]
	},
	{
		slug: 'about', title: 'About · Northwind Studio', eyebrow: 'About the studio', headline: 'Small team. Wide perspective.',
		intro: 'Northwind is an independent practice bringing strategy, design, and technology together under one roof.',
		sectionLabel: 'How we work',
		sections: [
			{ heading: 'Together', body: 'We work directly with decision-makers and the people closest to the problem.' },
			{ heading: 'In the open', body: 'Frequent prototypes and honest conversations keep every project moving with confidence.' },
			{ heading: 'For the long run', body: 'We leave teams with adaptable systems, useful tools, and the knowledge to evolve them.' }
		]
	}
];

for (const starter of starterPages) {
	if (await db.query.pages.findFirst({ where: eq(pages.slug, starter.slug) })) continue;
	const now = new Date();
	const content = starterDocument(starter);
	await db.insert(pages).values({ id: crypto.randomUUID(), slug: starter.slug, title: starter.title, draftContent: content, publishedContent: content, draftUpdatedAt: now, publishedAt: now, updatedBy: 'admin' });
	console.log(`Created and published /${starter.slug}`);
}
