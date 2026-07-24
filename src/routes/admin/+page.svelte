<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import SitePage from '$lib/components/SitePage.svelte';
	import type { SurfaceColors } from '$lib/server/db/schema';

	let { data, form } = $props();
	function initialDraft() { return structuredClone(data.page.draftContent); }
	function initialPublished() { return data.page.publishedContent ? structuredClone(data.page.publishedContent) : null; }
	let draft = $state(initialDraft());
	let publishedDocument = $state(initialPublished());
	let publishing = $state(false);
	let showMedia = $state(false);
	let imageTarget = $state<{ id: string; label: string } | null>(null);
	let colorTarget = $state<{ id: string; label: string } | null>(null);
	let menuOpen = $state(false);
	let pageMenuOpen = $state(false);
	let viewport = $state<'desktop' | 'mobile'>('desktop');
	let currentPage = $derived(data.pages.find((page) => page.slug === data.page.slug));
	let isDirty = $derived(!publishedDocument || JSON.stringify(draft) !== JSON.stringify(publishedDocument));
	let selectedImage = $derived.by(() => {
		const target = imageTarget;
		return target ? data.images.find((image) => image.id === draft.images[target.id]) : null;
	});

	function registerText(id: string, fallback: string) {
		if (!(id in draft.fields)) draft.fields[id] = fallback;
		if (publishedDocument && !(id in publishedDocument.fields)) publishedDocument.fields[id] = fallback;
	}
	function registerImage(id: string) {
		if (!(id in draft.images)) draft.images[id] = '';
		if (publishedDocument && !(id in publishedDocument.images)) publishedDocument.images[id] = '';
	}
	function registerSurface(id: string, defaults: SurfaceColors) {
		if (!(id in draft.surfaces)) draft.surfaces[id] = { ...defaults };
		if (publishedDocument && !(id in publishedDocument.surfaces)) publishedDocument.surfaces[id] = { ...defaults };
	}
	function openImage(id: string, label: string) {
		imageTarget = { id, label }; showMedia = true; colorTarget = null;
	}
	function chooseImage(id = '') {
		if (imageTarget) draft.images[imageTarget.id] = id;
		showMedia = false;
	}
	function openColors(id: string, label: string) {
		colorTarget = colorTarget?.id === id ? null : { id, label };
		showMedia = false;
	}
	function switchPage(slug: string) {
		pageMenuOpen = false; menuOpen = false;
		if (slug !== data.page.slug) window.location.assign(`/admin?page=${encodeURIComponent(slug)}`);
	}

	const enhanceEditor: SubmitFunction = ({ submitter }) => {
		const isPublish = submitter?.getAttribute('formaction')?.includes('/publish') ?? false;
		const submittedDocument = structuredClone(draft);
		if (isPublish) publishing = true;
		return async ({ result, update }) => {
			await update();
			if (!isPublish) return;
			publishing = false;
			if (result.type === 'success') publishedDocument = submittedDocument;
		};
	};
</script>

<svelte:head><title>Visual editor · AJE+SKATEPARK</title></svelte:head>

<header class="editor-bar" class:menu-open={menuOpen}>
	<div class="editor-brand"><a href="/">AJE+SKATEPARK</a><span>Visual editor</span></div>
	<div class="center-tools">
		<div class="page-switcher" onfocusout={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) pageMenuOpen = false; }}>
			<button class="page-trigger" class:open={pageMenuOpen} onclick={() => pageMenuOpen = !pageMenuOpen} aria-haspopup="menu" aria-expanded={pageMenuOpen}>
				<span class="page-icon">▤</span><span class="page-trigger-copy"><small>Current page</small><strong>{currentPage?.title ?? data.page.title}</strong></span><span class="chevron"></span>
			</button>
			{#if pageMenuOpen}<div class="page-menu"><p>Website pages</p>{#each data.pages as page}<button type="button" onclick={() => switchPage(page.slug)} class:active={page.slug === data.page.slug}><span><strong>{page.title}</strong><small>{page.slug === 'home' ? '/' : `/${page.slug}`}</small></span>{#if page.slug === data.page.slug}<b>✓</b>{/if}</button>{/each}</div>{/if}
		</div>
		<div class="view-switch"><button class:active={viewport === 'desktop'} onclick={() => viewport = 'desktop'} aria-label="Desktop preview">▭</button><button class:active={viewport === 'mobile'} onclick={() => viewport = 'mobile'} aria-label="Mobile preview">▯</button></div>
	</div>
	<div class="editor-actions">
		<a href={data.page.slug === 'home' ? '/' : `/${data.page.slug}`} target="_blank">Open live site ↗</a>
		<button class="save-button" form="visual-editor">Save draft</button>
		<button class="publish-button" form="visual-editor" formaction="?/publish" disabled={!isDirty || publishing}>{publishing ? 'Publishing…' : 'Publish'}</button>
		<form method="POST" action="?/logout"><button class="logout">Log out</button></form>
	</div>
	<button class="menu-toggle" class:open={menuOpen} onclick={() => { menuOpen = !menuOpen; if (menuOpen) colorTarget = null; }} aria-label="Toggle editor menu" aria-expanded={menuOpen}><span></span><span></span><span></span></button>
</header>
{#if menuOpen}<button class="toolbar-backdrop" onclick={() => { menuOpen = false; pageMenuOpen = false; }} aria-label="Close editor menu"></button>{/if}

{#if form?.saved || form?.published || form?.saveError || form?.publishError}<div class:success={form?.saved || form?.published} class:error={form?.saveError || form?.publishError} class="toast">{form?.published ? 'Changes are live.' : form?.saved ? 'Draft saved.' : form?.saveError ?? form?.publishError}</div>{/if}

<div class="stage" class:mobile={viewport === 'mobile'} class:dimmed={showMedia}>
	<form id="visual-editor" method="POST" action="?/save" use:enhance={enhanceEditor}>
		<input type="hidden" name="pageId" value={data.page.id} />
		<input type="hidden" name="documentJson" value={JSON.stringify(draft)} />
		<div class="site">
			<SitePage document={draft} images={data.images} editing={true} {registerText} {registerImage} {registerSurface} onEditImage={openImage} onEditColors={openColors} />
		</div>
	</form>
</div>

{#if colorTarget}
	<aside class="color-editor">
		<header><div><small>Style editor</small><strong>{colorTarget.label}</strong></div><button onclick={() => colorTarget = null}>×</button></header>
		<label><span>Background</span><div><input type="color" bind:value={draft.surfaces[colorTarget.id].background} /><input class="hex" bind:value={draft.surfaces[colorTarget.id].background} maxlength="7" pattern="#[0-9a-fA-F]{6}" /></div></label>
		<label><span>Text</span><div><input type="color" bind:value={draft.surfaces[colorTarget.id].text} /><input class="hex" bind:value={draft.surfaces[colorTarget.id].text} maxlength="7" pattern="#[0-9a-fA-F]{6}" /></div></label>
		<label><span>Global accent</span><div><input type="color" bind:value={draft.accent} /><input class="hex" bind:value={draft.accent} maxlength="7" pattern="#[0-9a-fA-F]{6}" /></div></label>
		<p>Changes appear instantly and are stored as validated design tokens.</p>
	</aside>
{/if}

{#if showMedia && imageTarget}
	<div class="media-overlay"><button class="media-backdrop" onclick={() => showMedia = false} aria-label="Close image picker"></button>
		<div class="media-dialog" role="dialog" aria-modal="true"><header><div><p>Media library</p><h2>Choose {imageTarget.label}</h2></div><button onclick={() => showMedia = false}>×</button></header>
			<div class="media-grid"><button class="media-item" class:selected={!selectedImage} onclick={() => chooseImage()}><div class="mini-art"></div><span>Graphic placeholder</span></button>{#each data.images as image}<button class="media-item" class:selected={selectedImage?.id === image.id} onclick={() => chooseImage(image.id)}><img src={'/media/' + image.variants.find((variant) => variant.format === 'webp')?.filename} alt={image.alt} /><span>{image.alt}</span></button>{/each}</div>
			<div class="upload-panel"><div><strong>Upload a new image</strong><small>JPEG, PNG, WebP or AVIF · max 10 MB</small></div><form method="POST" action="?/upload" enctype="multipart/form-data" use:enhance><input type="file" name="image" accept="image/jpeg,image/png,image/webp,image/avif" required /><input name="alt" maxlength="240" required placeholder="Image alt text" /><button>Upload & optimize</button></form>{#if form?.uploaded}<p class="good">Image uploaded. Select it above.</p>{/if}{#if form?.uploadError}<p class="bad">{form.uploadError}</p>{/if}</div>
		</div>
	</div>
{/if}

<style>
	.editor-bar{height:62px;position:sticky;top:0;z-index:30;background:#122d23;color:#fff;display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:center;padding:0 16px;box-shadow:0 2px 14px #071c1570;white-space:nowrap}.editor-brand,.editor-actions,.center-tools,.view-switch{display:flex;align-items:center;min-width:0}.editor-brand a{font:700 17px Georgia,serif;text-decoration:none}.editor-brand span{font-size:9px;margin-left:10px;padding-left:10px;border-left:1px solid #557065;color:#b8c8c0}.center-tools{gap:6px}.page-switcher{height:36px;position:relative}.page-trigger{width:190px;height:36px;display:grid;grid-template-columns:24px minmax(0,1fr) 16px;align-items:center;gap:7px;padding:0 8px;border:1px solid #405c50;border-radius:6px;background:#0b2119;color:#fff;text-align:left;cursor:pointer}.page-trigger:hover,.page-trigger.open{border-color:#779287;background:#102a20}.page-icon{display:grid;place-items:center;width:24px;height:24px;border-radius:4px;background:#234538;color:#b9cdc4}.page-trigger-copy{min-width:0}.page-trigger-copy small,.page-trigger-copy strong{display:block;overflow:hidden;text-overflow:ellipsis}.page-trigger-copy small{color:#81998e;font-size:7px;text-transform:uppercase;letter-spacing:.12em}.page-trigger-copy strong{font-size:10px}.chevron{width:7px;height:7px;border-right:1.5px solid #91a79d;border-bottom:1.5px solid #91a79d;transform:rotate(45deg);transform-origin:50% 50%;transition:.18s}.page-trigger.open .chevron{transform:rotate(225deg)}.page-menu{position:absolute;z-index:40;top:44px;left:50%;width:270px;transform:translateX(-50%);padding:8px;background:#173429;border:1px solid #456457;border-radius:8px;box-shadow:0 18px 45px #06130e80}.page-menu>p{margin:5px 8px 8px;color:#829a8f;font-size:8px;text-transform:uppercase;letter-spacing:.14em}.page-menu button{display:flex;width:100%;justify-content:space-between;padding:9px 10px;border:0;border-radius:5px;background:transparent;color:#d5e0da;text-align:left;cursor:pointer}.page-menu button:hover{background:#24483a}.page-menu button.active{background:#f1eee5;color:#183a2c}.page-menu button span,.page-menu button strong,.page-menu button small{display:block;min-width:0;overflow:hidden;text-overflow:ellipsis}.page-menu button strong{font-size:11px}.page-menu button small{color:#829a8f;font-size:9px}.page-menu button b{color:#d35b35}.view-switch{background:#0b2119;border:1px solid #405c50;border-radius:6px;padding:2px}.view-switch button{width:32px;height:28px;border:0;background:transparent;color:#91a79d;border-radius:4px}.view-switch button.active{background:#f3f0e7;color:#183a2c}.editor-actions{justify-content:flex-end;gap:7px}.editor-actions a{font-size:10px;color:#c4d0ca;text-decoration:none}.editor-actions button{height:32px;border-radius:4px;padding:0 11px;font-size:10px;white-space:nowrap;cursor:pointer}.save-button{border:1px solid #668075;background:transparent;color:#fff}.publish-button{border:0;background:#d35b35;color:#fff;font-weight:700}.publish-button:disabled{background:#65716c;color:#b8c0bd;cursor:not-allowed}.logout{border:1px solid #405c50;background:#0b2119;color:#c8d5cf}.menu-toggle,.toolbar-backdrop{display:none}
	.toast{position:fixed;z-index:46;top:72px;left:50%;transform:translateX(-50%);padding:11px 18px;border-radius:30px;box-shadow:0 8px 30px #0002;font-size:12px;font-weight:700}.success,.good{background:#dff5e8;color:#1f6940}.error,.bad{background:#fde3db;color:#922f18}.stage{min-height:calc(100vh - 62px);background:#d9d8d3;padding:30px}.stage>form{max-width:1320px;margin:auto;box-shadow:0 12px 50px #1a211c26;transition:max-width .3s}.stage.mobile>form{max-width:430px}.site{background:#f4f1e9;overflow:hidden}
	.color-editor{position:fixed;z-index:45;top:76px;right:18px;width:260px;padding:15px;background:#f7f5ef;color:#17211b;border:1px solid #c9c6bc;border-radius:9px;box-shadow:0 20px 60px #0a17124d}.color-editor header{display:flex;justify-content:space-between}.color-editor header small,.color-editor header strong{display:block}.color-editor header small{text-transform:uppercase;color:#a94b2e;font-size:8px}.color-editor header strong{font:400 19px Georgia,serif}.color-editor header button{border:0;background:transparent;font-size:24px}.color-editor label{display:block;margin:12px 0}.color-editor label>span{display:block;font-size:10px;font-weight:700;margin-bottom:6px}.color-editor label div{display:grid;grid-template-columns:38px 1fr;gap:7px}.color-editor input[type=color]{width:38px;height:34px;padding:3px}.hex{min-width:0;padding:0 9px;font:11px monospace;text-transform:uppercase}.color-editor p{font-size:9px;color:#747a76;border-top:1px solid #ddd9cf;padding-top:10px}
	.media-overlay{position:fixed;inset:0;z-index:50;display:grid;place-items:center;padding:25px}.media-backdrop{position:absolute;inset:0;width:100%;height:100%;border:0;background:#0b1c1685;backdrop-filter:blur(9px)}.media-dialog{position:relative;width:min(920px,100%);max-height:88vh;overflow:auto;background:#f7f5ef;border-radius:10px}.media-dialog>header{display:flex;justify-content:space-between;padding:24px 28px;border-bottom:1px solid #d8d5cc}.media-dialog header p{margin:0;color:#b64b2b;font-size:10px;text-transform:uppercase}.media-dialog h2{margin:5px 0 0;font:400 28px Georgia}.media-dialog header button{border:0;background:transparent;font-size:28px}.media-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;padding:25px}.media-item{border:2px solid transparent;background:#fff;padding:5px;text-align:left}.media-item.selected{border-color:#d35b35}.media-item img,.mini-art{width:100%;aspect-ratio:1.4;object-fit:cover;display:block}.mini-art{background:linear-gradient(135deg,#d86a3b 0 50%,#173b2c 50%)}.media-item span{display:block;padding:7px;font-size:10px}.upload-panel{border-top:1px solid #ddd;padding:20px 28px;display:grid;grid-template-columns:180px 1fr;gap:15px}.upload-panel small{display:block;color:#777}.upload-panel form{display:grid;grid-template-columns:1fr 1fr auto;gap:8px}.upload-panel input{min-width:0;padding:8px}.upload-panel button{background:#173b2c;color:#fff;border:0}.upload-panel p{grid-column:1/-1;padding:8px;margin:0;font-size:10px}
	@media(max-width:1150px) and (min-width:901px){.editor-brand span,.editor-actions a{display:none}.page-trigger{width:155px}}
	@media(max-width:900px){.editor-bar{height:54px;grid-template-columns:1fr auto;padding:0 12px}.editor-brand span{display:none}.menu-toggle{display:flex;width:36px;height:36px;border:1px solid #405c50;border-radius:6px;background:#0b2119;flex-direction:column;justify-content:center;align-items:center;gap:4px}.menu-toggle span{width:16px;height:1.5px;background:#d8e2dd}.center-tools,.editor-actions{position:absolute;left:0;right:0;background:#122d23;opacity:0;visibility:hidden;pointer-events:none;transform:translateY(-10px);transition:.18s;padding:0 12px}.center-tools{top:54px;height:58px}.editor-actions{top:112px;height:58px;gap:5px}.menu-open .center-tools,.menu-open .editor-actions{opacity:1;visibility:visible;pointer-events:auto;transform:none}.page-switcher{flex:1}.page-trigger{width:100%}.page-menu{left:0;transform:none;width:min(300px,calc(100vw - 24px))}.editor-actions a{flex:1;font-size:9px}.editor-actions button{padding:0 8px}.toolbar-backdrop{display:block;position:fixed;z-index:19;inset:54px 0 0;border:0;background:#07130e55;backdrop-filter:blur(2px)}.stage{padding:8px}.color-editor{top:62px;left:10px;right:10px;width:auto}.media-grid{grid-template-columns:repeat(2,1fr)}.upload-panel,.upload-panel form{grid-template-columns:1fr}}
</style>
