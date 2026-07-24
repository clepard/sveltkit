<script lang="ts">
	let { children } = $props();
</script>

<svelte:head><meta name="viewport" content="width=device-width, initial-scale=1" /></svelte:head>
{@render children()}

<style>
	:global(*) { box-sizing: border-box; }
	:global(body) { margin: 0; font-family: Inter, ui-sans-serif, system-ui, sans-serif; color: #17211b; background: #f4f1e9; }
	:global(button), :global(input), :global(textarea), :global(select) { font: inherit; }
	:global(a) { color: inherit; }
</style>
