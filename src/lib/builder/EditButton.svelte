<script lang="ts">
	import EditText from './EditText.svelte';
	import { useBuilder } from './context';

	let { id, href, fallback, surfaceId = `${id}.colors`, class: className = '', arrow = '↘' } = $props<{
		id: string; href: string; fallback: string; surfaceId?: string; class?: string; arrow?: string;
	}>();
	const builder = useBuilder();
	const defaults = { background: '#173b2c', text: '#ffffff' };
	let colors = $derived(builder.document.surfaces[surfaceId] ?? defaults);
	$effect(() => builder.registerSurface(surfaceId, defaults));
</script>

<span class="cms-button-wrap">
	<a {href} class={className} style:background-color={colors.background} style:color={colors.text} onclick={(event) => { if (builder.editing) event.preventDefault(); }}>
		<EditText {id} as="span" {fallback} class="cms-button-copy" /> <b>{arrow}</b>
	</a>
	{#if builder.editing}
		<button type="button" class="cms-button-colors" data-color-trigger onclick={() => builder.openColors(surfaceId, 'Button')} aria-label="Edit button colors">
			<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 0 0 0 18h1.15a2.35 2.35 0 0 0 1.63-4.04 1.75 1.75 0 0 1 1.2-3.03H18A3 3 0 0 0 21 11a8 8 0 0 0-9-8Z"/><circle cx="7.5" cy="11.5" r="1"/><circle cx="9" cy="7.5" r="1"/><circle cx="13.5" cy="6.5" r="1"/><circle cx="17" cy="9" r="1"/></svg>
			<span>Colors</span>
		</button>
	{/if}
</span>

<style>
	.cms-button-wrap{position:relative;display:inline-block}
	.cms-button-colors{position:absolute;z-index:9;right:-8px;top:-14px;display:flex;align-items:center;gap:6px;height:29px;padding:0 9px;border:1px solid #d4d8d5;border-radius:7px;background:#fff;color:#173b2c;box-shadow:0 5px 18px #071c1528;cursor:pointer;font-size:9px;font-weight:750;opacity:.72;transition:.15s}
	.cms-button-colors svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
	.cms-button-colors circle{fill:currentColor;stroke:none}
	.cms-button-wrap:hover .cms-button-colors,.cms-button-colors:focus-visible{opacity:1;transform:translateY(-1px)}
	:global(.cms-button-copy){min-width:40px}
	@media(max-width:900px){.cms-button-colors span{display:none}.cms-button-colors{right:-5px;padding:0 7px}}
</style>
