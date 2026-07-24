<script lang="ts">
	import type { Snippet } from 'svelte';
	import { useBuilder } from './context';

	let { id, label, class: className = '', fallback } = $props<{
		id: string; label: string; class?: string; fallback?: Snippet;
	}>();
	const builder = useBuilder();
	let image = $derived(builder.images.find((item) => item.id === builder.document.images[id]));
	let source = $derived(image?.variants.at(-1));
	$effect(() => builder.registerImage(id));
</script>

{#snippet visual()}
	{#if image && source}
		{#key source.filename}
			<img src={'/media/' + source.filename} alt={image.alt} width={image.width} height={image.height} />
		{/key}
	{:else if fallback}{@render fallback()}{/if}
{/snippet}

{#if builder.editing}
	<button type="button" class={`${className} cms-image`} onclick={() => builder.openImage(id, label)} aria-label={`Change ${label}`}>
		{@render visual()}<span class="cms-image-badge"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="9" r="1.5"/><path d="m4 17 5-5 4 4 2-2 5 4"/></svg>Change image</span>
	</button>
{:else}
	<div class={className}>{@render visual()}</div>
{/if}

<style>
	.cms-image{border:0;padding:0;cursor:pointer;position:relative;overflow:hidden}
	.cms-image-badge{position:absolute;left:50%;top:50%;display:flex;align-items:center;gap:8px;transform:translate(-50%,-50%);background:#fff;color:#173b2c;border:1px solid #d4d8d5;border-radius:8px;padding:10px 13px;font-size:10px;font-weight:750;box-shadow:0 8px 28px #071c1550;opacity:0;transition:.18s;white-space:nowrap}
	.cms-image-badge svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
	.cms-image:hover .cms-image-badge,.cms-image:focus-visible .cms-image-badge{opacity:1}
	.cms-image:hover :global(img){filter:brightness(.68)}
</style>
