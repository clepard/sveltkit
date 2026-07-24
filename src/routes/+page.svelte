<script lang="ts">
	import SitePage from '$lib/components/SitePage.svelte';
	let { data } = $props();
</script>

<svelte:head>
	<title>{data.title}</title>
	<meta name="description" content={data.document?.fields['hero.intro'] ?? 'A demo website ready to edit.'} />
</svelte:head>

{#if data.document}
	<div class="website"><SitePage document={data.document} images={data.images} /></div>
{:else}
	<main class="empty"><h1>The site is being prepared.</h1><p>Sign in to the editor to publish the first draft.</p></main>
{/if}

<style>
	.website{max-width:1320px;margin:auto;overflow:hidden}.empty{min-height:70vh;max-width:1200px;margin:auto;padding:100px 32px}.empty h1{font:400 55px Georgia,serif}
</style>
