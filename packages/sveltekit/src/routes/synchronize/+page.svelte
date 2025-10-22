<!-- <script lang="ts">
	import { onMount } from 'svelte';

	const result: string[] = [];

	async function subscribe() {
		const response = await fetch('/synchronize');
		if (response.body) {
			const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
			while (true) {
				const { value, done } = await reader.read();
				if (done) break;
				result.push(value);
			}
		}
	}

	onMount(subscribe);
</script>

<h1>Synchronization progress</h1>
{#each result as str}
	<p>{str}</p>
{/each} -->
