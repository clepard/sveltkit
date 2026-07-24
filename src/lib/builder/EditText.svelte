<script lang="ts">
	import { useBuilder } from './context';

	let { id, as = 'span', fallback = '', class: className = '', multiline = false } = $props<{
		id: string; as?: string; fallback?: string; class?: string; multiline?: boolean;
	}>();
	const builder = useBuilder();
	function initialValue() { return builder.document.fields[id] ?? fallback; }
	let value = $state(initialValue());

	$effect(() => {
		builder.registerText(id, fallback);
		builder.document.fields[id] = value ?? '';
	});

	function keydown(event: KeyboardEvent) {
		if (!multiline && event.key === 'Enter') event.preventDefault();
	}
</script>

{#if builder.editing}
	<svelte:element
		this={as}
		class={`${className} cms-editable`}
		contenteditable="true"
		role="textbox"
		tabindex="0"
		aria-label={`Edit ${id}`}
		bind:textContent={value}
		onkeydown={keydown}
	></svelte:element>
{:else}
	<svelte:element this={as} class={className}>{value}</svelte:element>
{/if}

<style>
	.cms-editable{border-radius:3px;outline:1px dashed transparent;outline-offset:7px;transition:.15s;cursor:text}
	.cms-editable:hover{outline-color:#d35b35;background:#fff4ef55}
	.cms-editable:focus{outline:2px solid #d35b35;background:#fff;color:#17211b;box-shadow:0 0 0 6px #d35b3520}
	.cms-editable::selection{background:#f2b49f;color:#17211b}
	.cms-editable:empty::before{content:'Click to add text';color:#9c9c93}
</style>
