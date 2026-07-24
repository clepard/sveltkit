<script lang="ts">
	import { provideBuilder, type BuilderImage } from '$lib/builder/context';
	import EditButton from '$lib/builder/EditButton.svelte';
	import EditImage from '$lib/builder/EditImage.svelte';
	import EditSurface from '$lib/builder/EditSurface.svelte';
	import EditText from '$lib/builder/EditText.svelte';
	import type { PageDocument, SurfaceColors } from '$lib/server/db/schema';

	let {
		document, images = [], editing = false,
		registerText = () => {}, registerImage = () => {}, registerSurface = () => {},
		onEditImage = () => {}, onEditColors = () => {}
	} = $props<{
		document: PageDocument; images?: BuilderImage[]; editing?: boolean;
		registerText?: (id: string, fallback: string) => void;
		registerImage?: (id: string) => void;
		registerSurface?: (id: string, defaults: SurfaceColors) => void;
		onEditImage?: (id: string, label: string) => void;
		onEditColors?: (id: string, label: string) => void;
	}>();

	provideBuilder({
		get document() { return document; },
		get images() { return images; },
		get editing() { return editing; },
		registerText: (id, fallback) => registerText(id, fallback),
		registerImage: (id) => registerImage(id),
		registerSurface: (id, defaults) => registerSurface(id, defaults),
		openImage: (id, label) => onEditImage(id, label),
		openColors: (id, label) => onEditColors(id, label)
	});

	const defaultSections = [
		{ heading: 'Make it clear', body: 'Strategy and design should remove friction. We turn complicated ideas into focused, memorable experiences.' },
		{ heading: 'Build for change', body: 'Flexible systems help brands evolve without losing what makes them recognizable and trusted.' },
		{ heading: 'Stay curious', body: 'The strongest work comes from testing assumptions, learning quickly, and making room for unexpected answers.' }
	];
	let sections = $derived(document.collections.beliefs ?? defaultSections);

	$effect(() => {
		if (editing && !document.collections.beliefs) document.collections.beliefs = structuredClone(defaultSections);
	});

	function updateSection(index: number, field: 'heading' | 'body', event: Event) {
		document.collections.beliefs[index][field] = (event.currentTarget as HTMLElement).textContent ?? '';
	}
	function addSection() {
		if (document.collections.beliefs.length < 8) document.collections.beliefs.push({ heading: 'New section', body: 'Click here to write your text.' });
	}
	function removeSection(index: number) {
		if (document.collections.beliefs.length > 1) document.collections.beliefs.splice(index, 1);
	}
</script>

<EditSurface id="header" label="Header" as="nav" class="site-nav">
	<a href="/" onclick={(event) => { if (editing) event.preventDefault(); }}><EditText id="site.title" fallback="Northwind Studio" class="site-title" /></a>
	<div class="site-links"><a href="/work" onclick={(event) => { if (editing) event.preventDefault(); }}><EditText id="nav.work" fallback="Work" /></a><a href="/about" onclick={(event) => { if (editing) event.preventDefault(); }}><EditText id="nav.about" fallback="About" /></a></div>
</EditSurface>

<main>
	<EditSurface id="hero" label="Hero" class="hero">
		<div class="hero-copy">
			<EditText id="hero.eyebrow" as="p" fallback="Independent creative studio" class="eyebrow" />
			<EditText id="hero.headline" as="h1" fallback="Ideas that move at the speed of culture." multiline={true} />
			<EditText id="hero.intro" as="p" fallback="We partner with ambitious teams to shape identities, digital products, and stories that remain useful long after launch." class="intro" multiline={true} />
			<EditButton id="hero.cta" href="/work" fallback="Explore our work" surfaceId="button.primary" class="cta" />
		</div>
		<EditImage id="hero.image" label="hero image" class="hero-image">
			{#snippet fallback()}<div class="art" aria-hidden="true"><span></span><span></span><span></span></div>{/snippet}
		</EditImage>
	</EditSurface>

	<EditSurface id="work" label="Content section" class="work">
		<EditText id="work.label" as="p" fallback="What we believe" class="eyebrow" />
		<div class="section-grid">
			{#each sections as section, index}
				<article style:background-color={document.surfaces.work?.background ?? '#f4f1e9'} style:color={document.surfaces.work?.text ?? '#17211b'}>
					<div class="article-top"><span style:color={document.accent}>0{index + 1}</span>{#if editing}<button type="button" onclick={() => removeSection(index)} disabled={sections.length === 1} aria-label="Remove section">×</button>{/if}</div>
					<h2 class:cms-editable={editing} contenteditable={editing ? 'true' : undefined} oninput={(event) => updateSection(index, 'heading', event)}>{section.heading}</h2>
					<p class:cms-editable={editing} contenteditable={editing ? 'true' : undefined} oninput={(event) => updateSection(index, 'body', event)}>{section.body}</p>
				</article>
			{/each}
		</div>
		{#if editing}<button type="button" class="add-section" onclick={addSection} disabled={sections.length >= 8}>＋ Add section</button>{/if}
	</EditSurface>
</main>

<EditSurface id="footer" label="Footer" as="footer" class="site-footer" background="#173b2c" text="#ffffff">
	<EditText id="footer.brand" fallback="Northwind Studio" />
	<EditText id="footer.note" fallback="Independent digital practice · Vilnius" />
</EditSurface>

<style>
	:global(.site-nav){height:82px;display:flex;align-items:center;justify-content:space-between;padding:0 78px 0 32px;border-bottom:1px solid #c9c5b9}
	:global(.site-title){font:700 24px Georgia,serif;letter-spacing:-1px}:global(.site-nav a),.site-links a{color:inherit;text-decoration:none}.site-links{display:flex;gap:27px;font-size:13px}
	main{margin:0}.hero-copy{min-width:0}
	:global(.hero){min-height:650px;display:grid;grid-template-columns:1.1fr .9fr;gap:65px;align-items:center;padding:0 32px}
	:global(.eyebrow){text-transform:uppercase;letter-spacing:.16em;color:var(--accent,#b64b2b);font-size:11px;font-weight:700}
	:global(.hero h1){font:400 clamp(53px,6.5vw,98px)/.92 Georgia,serif;letter-spacing:-.055em;margin:24px 0 28px;white-space:pre-wrap}
	:global(.intro){max-width:610px;color:inherit;opacity:.72;font-size:19px;line-height:1.55;white-space:pre-wrap}
	:global(.cta){display:inline-flex;gap:35px;padding:16px 19px;margin-top:20px;font-size:14px;text-decoration:none}
	:global(.hero-image){height:510px;background:#d86a3b;display:block;overflow:hidden;position:relative;width:100%}
	:global(.hero-image picture),:global(.hero-image img),.art{display:block;width:100%;height:100%}:global(.hero-image img){object-fit:cover}
	.art{position:relative;background:#d86a3b}.art span{position:absolute;width:70%;aspect-ratio:1;border:2px solid #f5c9a6;border-radius:50%;left:15%;top:15%}.art span:nth-child(2){left:-18%;top:45%}.art span:nth-child(3){left:48%;top:50%}
	:global(.work){border-top:1px solid #c9c5b9;padding:74px 32px 90px}.section-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:#c9c5b9;margin-top:30px}.section-grid article{position:relative;padding:34px 30px 46px;min-height:300px}.article-top{display:flex;justify-content:space-between;font-size:11px}.article-top button{border:0;background:transparent;font-size:20px;color:#9a9d97;cursor:pointer;opacity:0}.section-grid article:hover .article-top button{opacity:1}.section-grid h2{font:400 31px Georgia,serif;margin:50px 0 17px}.section-grid article>p{color:inherit;opacity:.72;line-height:1.7;white-space:pre-wrap}.add-section{display:block;margin:25px auto 0;border:1px dashed currentColor;background:transparent;padding:10px 15px;color:inherit;cursor:pointer}
	:global(.site-footer){display:flex;justify-content:space-between;padding:35px 78px 35px 32px;font-size:13px}
	.cms-editable{border-radius:3px;outline:1px dashed transparent;outline-offset:7px;transition:.15s;cursor:text}.cms-editable:hover{outline-color:#d35b35;background:#fff4ef55}.cms-editable:focus{outline:2px solid #d35b35;background:#fff;color:#17211b;box-shadow:0 0 0 6px #d35b3520}
	@media(max-width:900px){.site-links{display:none}:global(.hero){grid-template-columns:1fr;padding:60px 24px;gap:35px}:global(.hero-image){height:380px}.section-grid{grid-template-columns:1fr}:global(.site-footer){flex-direction:column;gap:14px}}
</style>
