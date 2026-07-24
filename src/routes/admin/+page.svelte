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
	let uploading = $state(false);
	let uploadFilename = $state('');
	let showMedia = $state(false);
	let imageTarget = $state<{ id: string; label: string } | null>(null);
	let colorTarget = $state<{ id: string; label: string } | null>(null);
	let colorPanel: HTMLElement | undefined = $state();
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
	function dismissColors(event: PointerEvent) {
		if (!colorTarget || !(event.target instanceof Element)) return;
		if (colorPanel?.contains(event.target) || event.target.closest('[data-color-trigger]')) return;
		colorTarget = null;
	}
	function handleEscape(event: KeyboardEvent) {
		if (event.key !== 'Escape') return;
		colorTarget = null;
		showMedia = false;
	}
	function switchPage(slug: string) {
		pageMenuOpen = false; menuOpen = false;
		if (slug !== data.page.slug) window.location.assign(`/admin?page=${encodeURIComponent(slug)}`);
	}

	const enhanceEditor: SubmitFunction = ({ submitter }) => {
		const isPublish = submitter?.getAttribute('formaction')?.includes('/publish') ?? false;
		const submittedDocument = $state.snapshot(draft);
		if (isPublish) publishing = true;
		return async ({ result, update }) => {
			await update();
			if (!isPublish) return;
			publishing = false;
			if (result.type === 'success') publishedDocument = submittedDocument;
		};
	};
	const enhanceUpload: SubmitFunction = ({ formData, cancel }) => {
		if (uploading) {
			cancel();
			return;
		}
		const file = formData.get('image');
		if (!(file instanceof File) || !file.name) return;
		uploading = true;
		uploadFilename = file.name;
		return async ({ result, update }) => {
			await update({ reset: result.type === 'success', invalidateAll: result.type === 'success' });
			if (result.type === 'success' && result.data?.uploaded && typeof result.data.imageId === 'string' && imageTarget) {
				draft.images[imageTarget.id] = result.data.imageId;
				uploadFilename = '';
			}
			uploading = false;
		};
	};
</script>

<svelte:window onpointerdown={dismissColors} onkeydown={handleEscape} />
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
	<div class="color-editor" bind:this={colorPanel} role="dialog" aria-label={`Edit ${colorTarget.label} colors`}>
		<header>
			<div class="panel-heading"><span class="panel-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 0 0 0 18h1.15a2.35 2.35 0 0 0 1.63-4.04 1.75 1.75 0 0 1 1.2-3.03H18A3 3 0 0 0 21 11a8 8 0 0 0-9-8Z"/></svg></span><div><small>Colors</small><strong>{colorTarget.label}</strong></div></div>
			<button type="button" class="panel-close" onclick={() => colorTarget = null} aria-label="Close color editor">×</button>
		</header>
		<div class="color-preview" style:background={draft.surfaces[colorTarget.id].background} style:color={draft.surfaces[colorTarget.id].text}>
			<span style:background={draft.accent}></span><strong>Live preview</strong><small>Text and accent</small>
		</div>
		<div class="color-fields">
			<label><span>Background</span><div class="color-control"><input type="color" bind:value={draft.surfaces[colorTarget.id].background} aria-label="Choose background color" /><input class="hex" bind:value={draft.surfaces[colorTarget.id].background} maxlength="7" pattern="#[0-9a-fA-F]{6}" aria-label="Background hex color" /></div></label>
			<label><span>Text</span><div class="color-control"><input type="color" bind:value={draft.surfaces[colorTarget.id].text} aria-label="Choose text color" /><input class="hex" bind:value={draft.surfaces[colorTarget.id].text} maxlength="7" pattern="#[0-9a-fA-F]{6}" aria-label="Text hex color" /></div></label>
			<label><span>Site accent</span><div class="color-control"><input type="color" bind:value={draft.accent} aria-label="Choose site accent color" /><input class="hex" bind:value={draft.accent} maxlength="7" pattern="#[0-9a-fA-F]{6}" aria-label="Accent hex color" /></div></label>
		</div>
		<p class="panel-note">Changes preview instantly. Publish when you are ready to make them live.</p>
	</div>
{/if}

{#if showMedia && imageTarget}
	<div class="media-overlay"><button class="media-backdrop" onclick={() => showMedia = false} aria-label="Close image picker"></button>
		<div class="media-dialog" role="dialog" aria-modal="true"><header><div><p>Media library</p><h2>Choose {imageTarget.label}</h2><small>Select an existing image or upload a new one.</small></div><button type="button" onclick={() => showMedia = false} aria-label="Close media library">×</button></header>
			<div class="media-grid">
				<button type="button" class="media-item" class:selected={!selectedImage} onclick={() => chooseImage()}><div class="mini-art"></div><span>Graphic placeholder</span></button>
				{#if uploading}
					<div class="media-item uploading-card" aria-live="polite">
						<div class="upload-visual"><span class="spinner"></span><strong>Uploading</strong><small>{uploadFilename}</small><i></i></div>
						<span>Adding to your library…</span>
					</div>
				{/if}
				{#each data.images as image}<button type="button" class="media-item" class:selected={selectedImage?.id === image.id} onclick={() => chooseImage(image.id)}><img src={'/media/' + image.variants.at(-1)?.filename} alt={image.alt} /><span>{image.alt}</span></button>{/each}
			</div>
			<div class="upload-panel">
				<div class="upload-copy"><span class="upload-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4"/></svg></span><div><strong>Upload a new image</strong><small>JPEG, PNG, WebP or AVIF · maximum 10 MB</small></div></div>
				<form method="POST" action="?/upload" enctype="multipart/form-data" use:enhance={enhanceUpload}>
					<label class="file-picker">
						<input type="file" name="image" accept="image/jpeg,image/png,image/webp,image/avif" required disabled={uploading} onchange={(event) => uploadFilename = event.currentTarget.files?.[0]?.name ?? ''} />
						<span>{uploadFilename || 'Choose an image'}</span><small>{uploadFilename ? 'Choose another file' : 'Alt text will use the filename'}</small>
					</label>
					<button class="upload-submit" disabled={!uploadFilename || uploading}>{uploading ? 'Uploading…' : 'Upload image'}</button>
					{#if form?.uploaded && !uploading}<p class="upload-message good">✓ Uploaded and selected. Choose another file to upload again.</p>{/if}
					{#if form?.uploadError && !uploading}<p class="upload-message bad">{form.uploadError}</p>{/if}
				</form>
			</div>
		</div>
	</div>
{/if}

<style>
	.editor-bar{height:62px;position:sticky;top:0;z-index:30;background:#122d23;color:#fff;display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:center;padding:0 16px;box-shadow:0 2px 14px #071c1570;white-space:nowrap}.editor-brand,.editor-actions,.center-tools,.view-switch{display:flex;align-items:center;min-width:0}.editor-brand a{font:700 17px Georgia,serif;text-decoration:none}.editor-brand span{font-size:9px;margin-left:10px;padding-left:10px;border-left:1px solid #557065;color:#b8c8c0}.center-tools{gap:6px}.page-switcher{height:36px;position:relative}.page-trigger{width:190px;height:36px;display:grid;grid-template-columns:24px minmax(0,1fr) 16px;align-items:center;gap:7px;padding:0 8px;border:1px solid #405c50;border-radius:6px;background:#0b2119;color:#fff;text-align:left;cursor:pointer}.page-trigger:hover,.page-trigger.open{border-color:#779287;background:#102a20}.page-icon{display:grid;place-items:center;width:24px;height:24px;border-radius:4px;background:#234538;color:#b9cdc4}.page-trigger-copy{min-width:0}.page-trigger-copy small,.page-trigger-copy strong{display:block;overflow:hidden;text-overflow:ellipsis}.page-trigger-copy small{color:#81998e;font-size:7px;text-transform:uppercase;letter-spacing:.12em}.page-trigger-copy strong{font-size:10px}.chevron{width:7px;height:7px;border-right:1.5px solid #91a79d;border-bottom:1.5px solid #91a79d;transform:rotate(45deg);transform-origin:50% 50%;transition:.18s}.page-trigger.open .chevron{transform:rotate(225deg)}.page-menu{position:absolute;z-index:40;top:44px;left:50%;width:270px;transform:translateX(-50%);padding:8px;background:#173429;border:1px solid #456457;border-radius:8px;box-shadow:0 18px 45px #06130e80}.page-menu>p{margin:5px 8px 8px;color:#829a8f;font-size:8px;text-transform:uppercase;letter-spacing:.14em}.page-menu button{display:flex;width:100%;justify-content:space-between;padding:9px 10px;border:0;border-radius:5px;background:transparent;color:#d5e0da;text-align:left;cursor:pointer}.page-menu button:hover{background:#24483a}.page-menu button.active{background:#f1eee5;color:#183a2c}.page-menu button span,.page-menu button strong,.page-menu button small{display:block;min-width:0;overflow:hidden;text-overflow:ellipsis}.page-menu button strong{font-size:11px}.page-menu button small{color:#829a8f;font-size:9px}.page-menu button b{color:#d35b35}.view-switch{background:#0b2119;border:1px solid #405c50;border-radius:6px;padding:2px}.view-switch button{width:32px;height:28px;border:0;background:transparent;color:#91a79d;border-radius:4px}.view-switch button.active{background:#f3f0e7;color:#183a2c}.editor-actions{justify-content:flex-end;gap:7px}.editor-actions a{font-size:10px;color:#c4d0ca;text-decoration:none}.editor-actions button{height:32px;border-radius:4px;padding:0 11px;font-size:10px;white-space:nowrap;cursor:pointer}.save-button{border:1px solid #668075;background:transparent;color:#fff}.publish-button{border:0;background:#d35b35;color:#fff;font-weight:700}.publish-button:disabled{background:#65716c;color:#b8c0bd;cursor:not-allowed}.logout{border:1px solid #405c50;background:#0b2119;color:#c8d5cf}.menu-toggle,.toolbar-backdrop{display:none}
	.toast{position:fixed;z-index:46;top:72px;left:50%;transform:translateX(-50%);padding:11px 18px;border-radius:30px;box-shadow:0 8px 30px #0002;font-size:12px;font-weight:700}.success,.good{background:#dff5e8;color:#1f6940}.error,.bad{background:#fde3db;color:#922f18}.stage{min-height:calc(100vh - 62px);background:#d9d8d3;padding:30px}.stage>form{max-width:1320px;margin:auto;box-shadow:0 12px 50px #1a211c26;transition:max-width .3s}.stage.mobile>form{max-width:430px}.site{background:#f4f1e9;overflow:hidden}
	.color-editor{position:fixed;z-index:45;top:76px;right:18px;width:292px;overflow:hidden;background:#fbfaf7;color:#17211b;border:1px solid #d7d9d4;border-radius:12px;box-shadow:0 24px 70px #071c1540}.color-editor header{display:flex;align-items:center;justify-content:space-between;padding:16px 17px;border-bottom:1px solid #e2e3df}.panel-heading{display:flex;align-items:center;gap:10px}.panel-icon{display:grid;place-items:center;width:34px;height:34px;border-radius:8px;background:#e9f0ec;color:#173b2c}.panel-icon svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.color-editor header small,.color-editor header strong{display:block}.color-editor header small{text-transform:uppercase;color:#8a948f;font-size:8px;font-weight:750;letter-spacing:.13em}.color-editor header strong{margin-top:2px;font-size:14px}.panel-close{display:grid;place-items:center;width:30px;height:30px;border:0;border-radius:6px;background:transparent;color:#68736e;font-size:22px;cursor:pointer}.panel-close:hover{background:#eceeea;color:#17211b}.color-preview{position:relative;display:grid;grid-template-columns:12px 1fr;column-gap:8px;margin:14px 16px 4px;padding:14px;border:1px solid #d7d9d4;border-radius:8px}.color-preview>span{grid-row:1/3;width:10px;height:100%;min-height:32px;border-radius:5px}.color-preview strong,.color-preview small{display:block}.color-preview strong{font-size:12px}.color-preview small{margin-top:2px;font-size:9px;opacity:.7}.color-fields{padding:4px 16px 10px}.color-editor label{display:block;margin:13px 0}.color-editor label>span{display:block;margin-bottom:6px;color:#59645f;font-size:9px;font-weight:750;text-transform:uppercase;letter-spacing:.08em}.color-control{display:grid;grid-template-columns:42px 1fr;gap:8px}.color-editor input[type=color]{width:42px;height:37px;padding:3px;border:1px solid #cfd3cf;border-radius:6px;background:#fff;cursor:pointer}.hex{min-width:0;padding:0 10px;border:1px solid #cfd3cf;border-radius:6px;background:#fff;color:#25342d;font:11px monospace;text-transform:uppercase}.hex:focus{outline:2px solid #739585;outline-offset:1px}.panel-note{margin:0;padding:12px 16px 14px;border-top:1px solid #e2e3df;background:#f3f4f0;color:#68736e;font-size:9px;line-height:1.45}
	.media-overlay{position:fixed;inset:0;z-index:50;display:grid;place-items:center;padding:25px}.media-backdrop{position:absolute;inset:0;width:100%;height:100%;border:0;background:#071c1594;backdrop-filter:blur(9px)}.media-dialog{position:relative;width:min(940px,100%);max-height:90vh;overflow:auto;background:#f8f8f5;border:1px solid #ffffff40;border-radius:14px;box-shadow:0 30px 100px #06130e70}.media-dialog>header{display:flex;align-items:center;justify-content:space-between;padding:23px 28px;border-bottom:1px solid #dfe1dc;background:#fbfbf8}.media-dialog header p{margin:0;color:#b64b2b;font-size:9px;font-weight:750;letter-spacing:.14em;text-transform:uppercase}.media-dialog h2{margin:4px 0 2px;font:400 27px Georgia}.media-dialog header small{color:#76807b;font-size:10px}.media-dialog header button{display:grid;place-items:center;width:34px;height:34px;border:0;border-radius:7px;background:transparent;color:#66716c;font-size:27px;cursor:pointer}.media-dialog header button:hover{background:#eceeea;color:#17211b}.media-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;min-height:190px;padding:24px}.media-item{overflow:hidden;border:2px solid transparent;border-radius:9px;background:#fff;padding:5px;text-align:left;box-shadow:0 3px 13px #071c1512;cursor:pointer;transition:border-color .15s,transform .15s,box-shadow .15s}.media-item:hover{transform:translateY(-2px);box-shadow:0 8px 22px #071c1520}.media-item.selected{border-color:#d35b35;box-shadow:0 0 0 2px #d35b3520}.media-item img,.mini-art,.upload-visual{width:100%;aspect-ratio:1.4;object-fit:cover;display:block}.mini-art{background:linear-gradient(135deg,#d86a3b 0 50%,#173b2c 50%)}.media-item>span{display:block;overflow:hidden;padding:8px 7px 6px;font-size:10px;text-overflow:ellipsis;white-space:nowrap}.uploading-card{border-color:#739585;background:#f3f7f4;cursor:wait}.uploading-card:hover{transform:none}.upload-visual{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;background:#e6eee9;color:#173b2c;text-align:center}.upload-visual strong{margin-top:8px;font-size:11px}.upload-visual small{max-width:90%;overflow:hidden;color:#63736b;font-size:8px;text-overflow:ellipsis;white-space:nowrap}.upload-visual i{position:absolute;right:0;bottom:0;left:0;height:3px;background:linear-gradient(90deg,transparent,#2f7154,transparent);animation:upload-progress 1.1s linear infinite}.spinner{width:23px;height:23px;border:2px solid #aec4b9;border-top-color:#245f45;border-radius:50%;animation:spin .75s linear infinite}.upload-panel{display:grid;grid-template-columns:230px 1fr;gap:22px;padding:21px 28px;border-top:1px solid #dfe1dc;background:#fff}.upload-copy{display:flex;align-items:center;gap:11px}.upload-copy strong,.upload-copy small{display:block}.upload-copy strong{font-size:12px}.upload-copy small{margin-top:3px;color:#77817c;font-size:9px;line-height:1.4}.upload-icon{display:grid;flex:0 0 auto;place-items:center;width:38px;height:38px;border-radius:9px;background:#e8f0eb;color:#1d5a3f}.upload-icon svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.upload-panel form{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:9px}.file-picker{position:relative;display:flex;min-width:0;flex-direction:column;justify-content:center;padding:9px 12px;border:1px dashed #aab4af;border-radius:7px;background:#fafbf9;cursor:pointer}.file-picker:hover{border-color:#567b69;background:#f4f8f5}.file-picker input{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}.file-picker span,.file-picker small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.file-picker span{color:#273b32;font-size:10px;font-weight:750}.file-picker small{margin-top:2px;color:#7a847f;font-size:8px}.upload-submit{min-width:116px;border:0;border-radius:7px;background:#173b2c;color:#fff;padding:0 15px;font-size:10px;font-weight:750;cursor:pointer}.upload-submit:disabled{background:#a6afaa;color:#eef0ef;cursor:not-allowed}.upload-message{grid-column:1/-1;margin:0;padding:8px 10px;border-radius:6px;font-size:9px}.good{background:#dff5e8;color:#1f6940}.bad{background:#fde3db;color:#922f18}@keyframes spin{to{transform:rotate(360deg)}}@keyframes upload-progress{from{transform:translateX(-100%)}to{transform:translateX(100%)}}
	@media(max-width:1150px) and (min-width:901px){.editor-brand span,.editor-actions a{display:none}.page-trigger{width:155px}}
	@media(max-width:900px){.editor-bar{height:54px;grid-template-columns:1fr auto;padding:0 12px}.editor-brand span{display:none}.menu-toggle{display:flex;width:36px;height:36px;border:1px solid #405c50;border-radius:6px;background:#0b2119;flex-direction:column;justify-content:center;align-items:center;gap:4px}.menu-toggle span{width:16px;height:1.5px;background:#d8e2dd}.center-tools,.editor-actions{position:absolute;left:0;right:0;background:#122d23;opacity:0;visibility:hidden;pointer-events:none;transform:translateY(-10px);transition:.18s;padding:0 12px}.center-tools{top:54px;height:58px}.editor-actions{top:112px;height:58px;gap:5px}.menu-open .center-tools,.menu-open .editor-actions{opacity:1;visibility:visible;pointer-events:auto;transform:none}.page-switcher{flex:1}.page-trigger{width:100%}.page-menu{left:0;transform:none;width:min(300px,calc(100vw - 24px))}.editor-actions a{flex:1;font-size:9px}.editor-actions button{padding:0 8px}.toolbar-backdrop{display:block;position:fixed;z-index:19;inset:54px 0 0;border:0;background:#07130e55;backdrop-filter:blur(2px)}.stage{padding:8px}.color-editor{top:62px;left:10px;right:10px;width:auto}.media-grid{grid-template-columns:repeat(2,1fr)}.upload-panel,.upload-panel form{grid-template-columns:1fr}}
</style>
