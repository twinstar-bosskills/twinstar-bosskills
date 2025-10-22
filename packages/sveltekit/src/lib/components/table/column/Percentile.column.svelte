<script lang="ts">
	import TextColorDamage from '$lib/components/TextColorDamage.svelte';
	import TextColorHealing from '$lib/components/TextColorHealing.svelte';

	export let percentiles: Promise<any>;
	export let guid: number;
</script>

<div>
	{#await percentiles}
		...
	{:then value}
		<TextColorDamage>{value.dps[guid] ?? 'N/A'}</TextColorDamage> |
		<TextColorHealing>{value.hps[guid] ?? 'N/A'}</TextColorHealing>
	{/await}
</div>
