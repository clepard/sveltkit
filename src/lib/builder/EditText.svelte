<script lang="ts">
	import { useBuilder } from './context';

	let { id, as = 'span', fallback = '', class: className = '', multiline = false } = $props<{
		id: string; as?: string; fallback?: string; class?: string; multiline?: boolean;
	}>();
	const builder = useBuilder();
	let value = $derived(builder.document.fields[id] ?? fallback);

	$effect(() => builder.registerText(id, fallback));

	function update(event: Event) {
		builder.document.fields[id] = (event.currentTarget as HTMLElement).textContent ?? '';
	}

	function keydown(event: KeyboardEvent) {
		if (!multiline && event.key === 'Enter') event.preventDefault();
	}
</script>

<svelte:element
	this={as}
	class={`${className}${builder.editing ? ' cms-editable' : ''}`}
	contenteditable={builder.editing ? 'true' : undefined}
	role={builder.editing ? 'textbox' : undefined}
	aria-label={builder.editing ? `Edit ${id}` : undefined}
	oninput={update}
	onkeydown={keydown}
>{value}</svelte:element>

<style>
	.cms-editable{border-radius:3px;outline:1px dashed transparent;outline-offset:7px;transition:.15s;cursor:text}
	.cms-editable:hover{outline-color:#d35b35;background:#fff4ef55}
	.cms-editable:focus{outline:2px solid #d35b35;background:#fff;color:#17211b;box-shadow:0 0 0 6px #d35b3520}
	.cms-editable::selection{background:#f2b49f;color:#17211b}
	.cms-editable:empty::before{content:'Click to add text';color:#9c9c93}
</style>
