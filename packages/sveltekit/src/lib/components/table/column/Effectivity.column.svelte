<script lang="ts">
	import { formatNumber } from '@twinstar-bosskills/core/dist/number';

	export let effectivity: number | null;
</script>

{#if typeof effectivity === 'number'}
	{formatNumber(effectivity)}
{:else}
	N/A
{/if}
