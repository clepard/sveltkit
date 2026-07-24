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

	const defaultStories = [
		{ heading: 'Make it clear', body: 'Strategy and design should remove friction. We turn complicated ideas into focused, memorable experiences.' },
		{ heading: 'Build for change', body: 'Flexible systems help brands evolve without losing what makes them recognizable and trusted.' },
		{ heading: 'Stay curious', body: 'The strongest work comes from testing assumptions, learning quickly, and making room for unexpected answers.' }
	];
	let stories = $derived(document.collections.beliefs ?? defaultStories);

	$effect(() => {
		if (editing && !document.collections.beliefs) document.collections.beliefs = structuredClone(defaultStories);
	});
</script>

<div class="editorial-site">
	<EditSurface id="masthead" label="Masthead" as="header" class="masthead" background="#f5f0e7" text="#111111">
		<div class="masthead-meta">
			<EditText id="site.kicker" fallback="Independent culture journal" class="micro-copy" />
			<span>Issue 01 / 2026</span>
			<span class="masthead-actions">Index&nbsp;&nbsp;&nbsp; Contact</span>
		</div>
		<a href="/" class="masthead-title" onclick={(event) => { if (editing) event.preventDefault(); }}>
			<EditText id="site.title" fallback="Northwind Journal" />
		</a>
	</EditSurface>

	<EditSurface id="topics" label="Navigation" as="nav" class="topic-bar" background="#f2df4b" text="#111111">
		<span class="topic-label">Explore</span>
		<a href="/" onclick={(event) => { if (editing) event.preventDefault(); }}>All</a>
		<a href="/work" onclick={(event) => { if (editing) event.preventDefault(); }}><EditText id="nav.work" fallback="Stories" /></a>
		<a href="/about" onclick={(event) => { if (editing) event.preventDefault(); }}><EditText id="nav.about" fallback="Studio" /></a>
		<span>Ideas</span><span>People</span><span>Places</span>
	</EditSurface>

	<main>
		<EditSurface id="feature" label="Featured story" class="feature-section" background="#f5f0e7" text="#111111">
			<div class="section-cap"><span>Featured story</span><span>Read / 06 min</span></div>
			<div class="feature-layout">
				<article class="feature-copy" style:background-color={document.surfaces.topics?.background ?? '#f2df4b'} style:color={document.surfaces.topics?.text ?? '#111111'}>
					<EditText id="hero.eyebrow" as="p" fallback="Design · Culture" class="story-meta" />
					<EditText id="hero.headline" as="h1" fallback="Ideas that move at the speed of culture." multiline={true} />
					<EditText id="hero.intro" as="p" fallback="A closer look at the people, places, and practices shaping how creative work gets made." class="feature-intro" multiline={true} />
					<EditButton id="hero.cta" href="/work" fallback="Read the story" surfaceId="button.primary" class="story-link" arrow="→" />
				</article>
				<EditImage id="hero.image" label="featured story image" class="feature-image">
					{#snippet fallback()}<div class="feature-art" aria-hidden="true"><span>FIELD</span><i></i><b>01</b></div>{/snippet}
				</EditImage>
				<aside class="feature-notes">
					<p>In this issue</p>
					{#each stories.slice(0, 3) as story, index}
						<div><span>0{index + 1}</span><strong>{story.heading}</strong><small>{index === 0 ? 'Perspective' : index === 1 ? 'Field note' : 'Conversation'}</small></div>
					{/each}
				</aside>
			</div>
		</EditSurface>

		<EditSurface id="stories" label="Stories" class="stories-section" background="#f5f0e7" text="#111111">
			<div class="section-heading">
				<EditText id="work.label" as="h2" fallback="The latest" />
				<span>Selected notes and observations</span>
			</div>
			<div class="story-grid">
				{#each stories as story, index}
					<article>
						<EditImage id={`story.image.${index}`} label={`story ${index + 1} image`} class="story-image">
							{#snippet fallback()}<div class={`story-art story-art-${index % 4}`} aria-hidden="true"><span>0{index + 1}</span><i></i></div>{/snippet}
						</EditImage>
						<div class="card-meta"><span>0{index + 1}.07.26</span><span>{index % 2 ? 'Culture' : 'Editorial'}</span></div>
						{#if editing}
							<h3 class="cms-editable" contenteditable="true" bind:textContent={story.heading}></h3>
							<p class="cms-editable" contenteditable="true" bind:textContent={story.body}></p>
						{:else}
							<h3>{story.heading}</h3>
							<p>{story.body}</p>
						{/if}
						<a href="/work" onclick={(event) => { if (editing) event.preventDefault(); }}>Read more <span>→</span></a>
					</article>
				{/each}
			</div>
		</EditSurface>

		<EditSurface id="spotlight" label="Spotlight" class="spotlight-section" background="#d9e5f4" text="#111111">
			<EditImage id="spotlight.image" label="spotlight image" class="spotlight-image">
				{#snippet fallback()}<div class="spotlight-art" aria-hidden="true"><span></span><span></span><b>OBJECTS<br/>WITH<br/>A STORY</b></div>{/snippet}
			</EditImage>
			<article class="spotlight-card" style:background-color={document.surfaces.topics?.background ?? '#f2df4b'} style:color={document.surfaces.topics?.text ?? '#111111'}>
				<EditText id="spotlight.eyebrow" as="p" fallback="The long read" class="story-meta" />
				<EditText id="spotlight.headline" as="h2" fallback="The small details that make a place unforgettable." multiline={true} />
				<EditText id="spotlight.intro" as="p" fallback="An editorial study of texture, rhythm, and the everyday objects that quietly shape our point of view." multiline={true} />
				<EditButton id="spotlight.cta" href="/about" fallback="Discover more" surfaceId="button.secondary" class="story-link" arrow="→" />
			</article>
		</EditSurface>

		<EditSurface id="newsletter" label="Newsletter" class="newsletter-section" background="#ded6c8" text="#111111">
			<EditText id="newsletter.headline" as="h2" fallback="Notes worth keeping, delivered occasionally." multiline={true} />
			<div class="newsletter-form"><span>Your email address</span><button type="button">Join the list</button></div>
			<EditText id="newsletter.note" as="p" fallback="No noise. Just new stories, studio notes, and useful references." />
		</EditSurface>
	</main>

	<EditSurface id="editorialFooter" label="Footer" as="footer" class="editorial-footer" background="#f2df4b" text="#111111">
		<div><EditText id="footer.brand" fallback="Northwind Journal" class="footer-brand" /><EditText id="footer.note" fallback="Independent digital practice · Vilnius" /></div>
		<div class="footer-links"><span>Stories</span><span>Studio</span><span>Archive</span><span>Instagram</span><span>Contact</span><span>Privacy</span></div>
		<small>© 2026 — Built for curious people.</small>
	</EditSurface>
</div>

<style>
	.editorial-site{--line:#1a1a1a2b;background:#f5f0e7;color:#111;font-family:"Courier New",monospace}
	:global(.masthead){padding:14px 24px 4px;border-bottom:1px solid var(--line)}
	.masthead-meta{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:20px;font-size:8px;text-transform:uppercase;letter-spacing:.08em}.masthead-actions{text-align:right}:global(.micro-copy){justify-self:start}.masthead-title{display:block;color:inherit;text-decoration:none;text-align:center}.masthead-title :global(span){display:block;font:400 clamp(82px,13.5vw,190px)/.82 Georgia,serif;letter-spacing:-.075em;white-space:nowrap}
	:global(.topic-bar){display:flex;align-items:center;justify-content:center;gap:8px;min-height:42px;padding:7px 20px;border-bottom:1px solid #111}:global(.topic-bar a),:global(.topic-bar>span:not(.topic-label)){border:1px solid currentColor;border-radius:20px;color:inherit;padding:4px 11px;text-decoration:none;font-size:8px;text-transform:uppercase}.topic-label{margin-right:5px;font-size:8px;text-transform:uppercase}:global(.topic-bar a:first-of-type){background:#111;color:#fff}
	main{margin:0}.section-cap,.section-heading{display:flex;align-items:end;justify-content:space-between}.section-cap{padding:0 0 12px;font-size:8px;text-transform:uppercase}.feature-section,.stories-section{padding:28px max(24px,calc((100vw - 1180px)/2))}
	.feature-layout{display:grid;grid-template-columns:.85fr 1.55fr .52fr;min-height:470px;border:1px solid var(--line)}.feature-copy{display:flex;flex-direction:column;padding:34px 28px}:global(.story-meta){margin:0 0 35px;font-size:8px;text-transform:uppercase}.feature-copy :global(h1){margin:0;font:400 clamp(32px,4vw,58px)/.94 Georgia,serif;letter-spacing:-.045em}:global(.feature-intro){margin:22px 0 30px;font-size:11px;line-height:1.55}:global(.story-link){display:inline-flex;align-items:center;justify-content:space-between;min-width:150px;margin-top:auto;padding:11px 13px;color:inherit;text-decoration:none;font-size:9px;text-transform:uppercase}:global(.story-link b){font-size:14px}
	:global(.feature-image){display:block;width:100%;height:100%;min-height:470px;background:#ddd}:global(.feature-image img){display:block;width:100%;height:100%;object-fit:cover}.feature-art{position:relative;display:grid;width:100%;height:100%;min-height:470px;place-items:center;overflow:hidden;background:#d8e5f2;color:#111}.feature-art:before,.feature-art:after{content:"";position:absolute;width:48%;aspect-ratio:1;border:1px solid #111;border-radius:50%}.feature-art:before{left:8%;top:8%}.feature-art:after{right:4%;bottom:7%}.feature-art span{font:400 clamp(54px,8vw,110px)/1 Georgia,serif;letter-spacing:-.08em}.feature-art i{position:absolute;width:2px;height:80%;background:#111;transform:rotate(25deg)}.feature-art b{position:absolute;right:24px;bottom:20px;font-size:10px}
	.feature-notes{padding:20px 16px;background:#f5f0e7}.feature-notes>p{margin:0 0 18px;font-size:8px;text-transform:uppercase}.feature-notes div{padding:14px 0;border-top:1px solid var(--line)}.feature-notes span,.feature-notes strong,.feature-notes small{display:block}.feature-notes span,.feature-notes small{font-size:7px;text-transform:uppercase}.feature-notes strong{margin:7px 0;font:400 15px/1.05 Georgia,serif}.feature-notes small{opacity:.6}
	:global(.stories-section){padding-top:46px;padding-bottom:64px}.section-heading{margin-bottom:17px;border-bottom:1px solid var(--line);padding-bottom:10px}.section-heading :global(h2){margin:0;font:400 31px/1 Georgia,serif}.section-heading span{font-size:8px;text-transform:uppercase}.story-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.story-grid article{min-width:0}:global(.story-image){display:block;width:100%;aspect-ratio:1.32;background:#ddd}:global(.story-image img){display:block;width:100%;height:100%;object-fit:cover}.story-art{position:relative;width:100%;height:100%;overflow:hidden}.story-art span{position:absolute;z-index:1;left:14px;top:12px;font-size:9px}.story-art i{position:absolute;inset:18%;border:1px solid currentColor;transform:rotate(12deg)}.story-art-0{background:#e7a885}.story-art-1{background:#a7c9bc}.story-art-2{background:#c7b8dc}.story-art-3{background:#d8d06e}.card-meta{display:flex;justify-content:space-between;padding:8px 0 6px;border-bottom:1px solid var(--line);font-size:7px;text-transform:uppercase}.story-grid h3{margin:13px 0 8px;font:400 23px/1.02 Georgia,serif}.story-grid article>p{min-height:48px;margin:0 0 13px;font-size:9px;line-height:1.5;opacity:.72}.story-grid article>a{color:inherit;font-size:8px;text-transform:uppercase;text-decoration:none}.story-grid article>a span{margin-left:5px}
	:global(.spotlight-section){position:relative;display:grid;grid-template-columns:1.6fr .8fr;gap:0;padding:38px max(24px,calc((100vw - 1180px)/2))}:global(.spotlight-image){display:block;min-height:480px}:global(.spotlight-image img){display:block;width:100%;height:100%;object-fit:cover}.spotlight-art{position:relative;width:100%;height:100%;min-height:480px;overflow:hidden;background:#d9e5f4}.spotlight-art span{position:absolute;width:50%;aspect-ratio:1;border:1px solid #111;border-radius:50%}.spotlight-art span:first-child{left:5%;top:10%}.spotlight-art span:nth-child(2){right:2%;bottom:5%}.spotlight-art b{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font:400 clamp(48px,7vw,90px)/.8 Georgia,serif;text-align:center;letter-spacing:-.06em}.spotlight-card{position:relative;z-index:2;align-self:center;margin-left:-52px;padding:32px 28px;box-shadow:0 18px 45px #1112}.spotlight-card :global(h2){margin:0;font:400 clamp(30px,3vw,47px)/.95 Georgia,serif;letter-spacing:-.04em}:global(.spotlight-card>p:not(.story-meta)){font-size:10px;line-height:1.55}
	:global(.newsletter-section){padding:56px max(24px,calc((100vw - 900px)/2));text-align:center}.newsletter-section :global(h2){max-width:720px;margin:0 auto 28px;font:400 clamp(34px,5vw,65px)/.95 Georgia,serif;letter-spacing:-.04em}.newsletter-form{display:flex;max-width:540px;margin:auto;border-bottom:1px solid currentColor}.newsletter-form span{flex:1;padding:12px 2px;text-align:left;font-size:9px;opacity:.65}.newsletter-form button{border:0;border-radius:20px;background:#111;color:#fff;padding:0 18px;font:8px "Courier New",monospace;text-transform:uppercase}:global(.newsletter-section>p){margin:13px 0 0;font-size:8px;opacity:.65}
	:global(.editorial-footer){display:grid;grid-template-columns:1fr 1fr;gap:45px;padding:52px max(24px,calc((100vw - 1180px)/2));border-top:1px solid #111}:global(.editorial-footer>div:first-child){display:flex;flex-direction:column;gap:8px;font-size:9px}:global(.footer-brand){font:400 30px Georgia,serif}.footer-links{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;font-size:8px;text-transform:uppercase}:global(.editorial-footer small){grid-column:1/-1;margin-top:38px;font-size:7px;text-transform:uppercase}
	.cms-editable{border-radius:3px;outline:1px dashed transparent;outline-offset:5px;transition:.15s;cursor:text}.cms-editable:hover{outline-color:#111;background:#fff5}.cms-editable:focus{outline:2px solid #111;background:#fff;color:#111;box-shadow:0 0 0 5px #fff8}
	@media(max-width:900px){.masthead-meta{grid-template-columns:1fr auto}.masthead-actions{display:none}.masthead-title :global(span){font-size:clamp(55px,16vw,100px)}.topic-bar{justify-content:flex-start;overflow-x:auto}.topic-bar span:nth-last-child(-n+3){display:none}.feature-layout{grid-template-columns:1fr}.feature-notes{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.feature-notes>p{grid-column:1/-1}.feature-image{min-height:360px}.story-grid{grid-template-columns:1fr 1fr}.spotlight-section{grid-template-columns:1fr}.spotlight-card{margin:-45px 18px 0}.editorial-footer{grid-template-columns:1fr}:global(.editorial-footer small){grid-column:auto}.footer-links{grid-template-columns:repeat(3,1fr)}}
	@media(max-width:580px){.masthead{padding-inline:12px}.masthead-title :global(span){font-size:18vw}.feature-section,.stories-section{padding-inline:12px}.feature-copy{padding:28px 20px}.feature-notes{grid-template-columns:1fr}.feature-notes>p{grid-column:auto}.story-grid{grid-template-columns:1fr}.section-heading span{display:none}.spotlight-section{padding-inline:12px}.spotlight-image,.spotlight-art{min-height:380px}.spotlight-card{margin:-28px 12px 0;padding:25px 20px}.newsletter-section,.editorial-footer{padding-inline:20px}.footer-links{grid-template-columns:1fr 1fr}}
</style>
