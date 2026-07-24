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
	{#if builder.editing}<button type="button" class="cms-button-colors" onclick={() => builder.openColors(surfaceId, 'Button')} aria-label="Edit button colors">◐</button>{/if}
</span>

<style>
	.cms-button-wrap{position:relative;display:inline-block}
	.cms-button-colors{position:absolute;right:-12px;top:-11px;width:24px;height:24px;border:1px solid #c8c7c1;border-radius:50%;background:#fff;color:#28382f;box-shadow:0 3px 10px #0002;cursor:pointer;opacity:.4}
	.cms-button-wrap:hover .cms-button-colors,.cms-button-colors:focus{opacity:1}
	:global(.cms-button-copy){min-width:40px}
</style>
