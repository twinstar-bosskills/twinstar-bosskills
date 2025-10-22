<script lang="ts">
	import TextColorWarning from '$lib/components/TextColorWarning.svelte';
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;
</script>

<h2>Generate Guild token</h2>

<form method="POST" action="/{data.realm}/guild-token/generate">
	<div>
		<label for="guild">Guild</label>
		<input id="guild" name="guild" type="text" />
	</div>
	<div>
		<label for="admin-token">Admin Token</label>
		<input id="admin-token" name="admin-token" type="password" value={data.token} />
	</div>
	<div>
		<button type="submit">Generate</button>
	</div>
</form>

{#if form && form.message}
	<p>
		<TextColorWarning>
			{form.message}
		</TextColorWarning>
	</p>
{/if}
