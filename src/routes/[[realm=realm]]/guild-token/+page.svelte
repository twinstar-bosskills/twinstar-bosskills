<script lang="ts">
	import TextColorWarning from '$lib/components/TextColorWarning.svelte';
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;
</script>

<h2>Set your guild token to see more data</h2>
<p><code>Guild token</code> was most likely given to you by {data.realm} server administrator</p>

<form method="POST" action="/{data.realm}/guild-token">
	<div>
		<label for="guild">Guild</label>
		<input id="guild" name="guild" type="text" value={data.guild} />
	</div>
	<div>
		<label for="token">Token</label>
		<input id="token" name="token" type="text" value={data.token} />
	</div>
	<div>
		<button type="submit">Save</button>
	</div>
</form>

{#if form && form.message}
	<p>
		<TextColorWarning>
			{form.message}
		</TextColorWarning>
	</p>
{/if}
