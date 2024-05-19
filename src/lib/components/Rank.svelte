<script lang="ts">
	import TextColorError from './TextColorError.svelte';
	import TextColorWarning from './TextColorWarning.svelte';

	export let rank: number;
</script>

{#if rank <= 200}
	🔥 <TextColorError>#{rank}</TextColorError>
{:else if rank <= 1000}
	⚠️ <TextColorWarning>#{rank}</TextColorWarning>
{:else}
	🥦 #{rank}
{/if}
