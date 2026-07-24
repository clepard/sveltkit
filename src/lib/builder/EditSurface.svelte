<script lang="ts">
	import type { Snippet } from 'svelte';
	import { useBuilder } from './context';

	let { id, label, as = 'section', class: className = '', background = '#f4f1e9', text = '#17211b', children } = $props<{
		id: string; label: string; as?: string; class?: string; background?: string; text?: string; children: Snippet;
	}>();
	const builder = useBuilder();
	let colors = $derived(builder.document.surfaces[id] ?? { background, text });
	$effect(() => builder.registerSurface(id, { background, text }));
</script>

<svelte:element this={as} class={`${className} cms-surface`} style:background-color={colors.background} style:color={colors.text} style:--accent={builder.document.accent}>
	{#if builder.editing}<button type="button" class="cms-colors" onclick={() => builder.openColors(id, label)} aria-label={`Edit ${label} colors`}>◐ <span>Colors</span></button>{/if}
	{@render children()}
</svelte:element>

<style>
	.cms-surface{position:relative;transition:background-color .18s,color .18s}
	.cms-colors{position:absolute;z-index:8;top:10px;right:10px;display:flex;align-items:center;gap:5px;border:1px solid #c8c7c1;border-radius:20px;background:#fff;color:#28382f;padding:6px 9px;box-shadow:0 4px 14px #0002;font-size:10px;font-weight:700;cursor:pointer;opacity:.35;transition:.15s}
	.cms-surface:hover>.cms-colors,.cms-colors:focus{opacity:1}
	@media(max-width:900px){.cms-colors{opacity:.8;padding:6px}.cms-colors span{display:none}}
</style>
