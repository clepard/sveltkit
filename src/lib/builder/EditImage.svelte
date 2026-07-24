<script lang="ts">
	import type { Snippet } from 'svelte';
	import { useBuilder } from './context';

	let { id, label, class: className = '', fallback } = $props<{
		id: string; label: string; class?: string; fallback?: Snippet;
	}>();
	const builder = useBuilder();
	let image = $derived(builder.images.find((item) => item.id === builder.document.images[id]));
	let webp = $derived(image?.variants.filter((variant) => variant.format === 'webp').at(-1));
	let avif = $derived(image?.variants.filter((variant) => variant.format === 'avif').at(-1));
	$effect(() => builder.registerImage(id));
</script>

{#snippet visual()}
	{#if image && webp}
		<picture>{#if avif}<source srcset={'/media/' + avif.filename} type="image/avif" />{/if}<img src={'/media/' + webp.filename} alt={image.alt} width={image.width} height={image.height} /></picture>
	{:else if fallback}{@render fallback()}{/if}
{/snippet}

{#if builder.editing}
	<button type="button" class={`${className} cms-image`} onclick={() => builder.openImage(id, label)} aria-label={`Change ${label}`}>
		{@render visual()}<span class="cms-image-badge">▧ Change image</span>
	</button>
{:else}
	<div class={className}>{@render visual()}</div>
{/if}

<style>
	.cms-image{border:0;padding:0;cursor:pointer;position:relative;overflow:hidden}
	.cms-image-badge{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);background:#fff;color:#173b2c;border-radius:5px;padding:11px 14px;font-size:12px;font-weight:700;box-shadow:0 5px 24px #0004;opacity:0;transition:.18s;white-space:nowrap}
	.cms-image:hover .cms-image-badge,.cms-image:focus .cms-image-badge{opacity:1}
	.cms-image:hover :global(img){filter:brightness(.72)}
</style>
