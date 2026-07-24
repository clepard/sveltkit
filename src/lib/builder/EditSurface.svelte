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
	{#if builder.editing}
		<button type="button" class="cms-colors" data-color-trigger onclick={() => builder.openColors(id, label)} aria-label={`Edit ${label} colors`}>
			<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 0 0 0 18h1.15a2.35 2.35 0 0 0 1.63-4.04 1.75 1.75 0 0 1 1.2-3.03H18A3 3 0 0 0 21 11a8 8 0 0 0-9-8Z"/><circle cx="7.5" cy="11.5" r="1"/><circle cx="9" cy="7.5" r="1"/><circle cx="13.5" cy="6.5" r="1"/><circle cx="17" cy="9" r="1"/></svg>
			<span>Edit colors</span>
		</button>
	{/if}
	{@render children()}
</svelte:element>

<style>
	.cms-surface{position:relative;transition:background-color .18s,color .18s}
	.cms-colors{position:absolute;z-index:8;top:12px;right:12px;display:flex;align-items:center;gap:7px;border:1px solid #d4d8d5;border-radius:7px;background:#fff;color:#173b2c;padding:7px 10px;box-shadow:0 5px 18px #071c1524;font-size:10px;font-weight:750;cursor:pointer;opacity:.68;transition:opacity .15s,transform .15s,box-shadow .15s}
	.cms-colors svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
	.cms-colors circle{fill:currentColor;stroke:none}
	.cms-surface:hover>.cms-colors,.cms-colors:focus-visible{opacity:1;transform:translateY(-1px);box-shadow:0 7px 22px #071c1530}
	@media(max-width:900px){.cms-colors{opacity:.9;padding:7px}.cms-colors span{display:none}}
</style>
