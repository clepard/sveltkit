<script lang="ts">
	let { form } = $props();
</script>

<svelte:head><title>Sign in · AJE+SKATEPARK</title></svelte:head>

<main>
	<form method="POST">
		<h1>AJE+SKATEPARK</h1>
		{#if form?.error}<p class="error">{form.error}</p>{/if}
		<label>User ID<input name="id" value={form?.id ?? 'admin'} autocomplete="username" required /></label>
		<label>Password<input name="password" type="password" autocomplete="current-password" required /></label>
		<button>Sign in</button>
	</form>
</main>

<style>
	main{min-height:100vh;display:grid;place-items:center;background:#173b2c;padding:22px}
	form{width:min(100%,390px);background:#f4f1e9;padding:42px}
	h1{font:700 27px/1 Georgia,serif;letter-spacing:-.04em;margin:0 0 38px;color:#17211b}
	.error{background:#f9ddd5;color:#8c2f17;padding:11px 12px;font-size:13px}
	label{display:grid;gap:7px;font-size:12px;font-weight:700;margin:18px 0}
	input{width:100%;padding:13px;border:1px solid #aaa99f;background:white}
	button{width:100%;border:0;background:#b64b2b;color:white;padding:14px;margin-top:18px;cursor:pointer;font-weight:700}
	@media(max-width:480px){form{padding:30px 24px}h1{font-size:24px}}
</style>
