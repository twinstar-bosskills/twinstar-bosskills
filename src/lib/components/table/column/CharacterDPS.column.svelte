<script lang="ts">
	import arrowDown from '$lib/assets/icons/arrow-down.svg?raw';
	import arrowUp from '$lib/assets/icons/arrow-up.svg?raw';
	import { characterDps, type CharacterMetricParts } from '$lib/metrics';

	import { formatNumber } from '$lib/number';
	export let character: CharacterMetricParts;
	export let effectivity: number | null | undefined = undefined;
	export let fightLength: number | undefined = undefined;
	export let performance: { dps: number } | undefined = undefined;

	$: dps = characterDps(character, fightLength);
	$: effectivityInfo = effectivity ? `Effectivity: ${formatNumber(effectivity)}` : undefined;
</script>

<div title={effectivityInfo}>{formatNumber(dps)}</div>
{#if performance && dps > 0}
	<div
		style="display: inline-flex; margin-left: 0.25rem;"
		title="Compared to previous kill with same difficulty"
	>
		({performance.dps.toLocaleString()}%
		<div
			style="height: 1rem; color: var({performance.dps < 0 ? '--color-error' : '--color-success'});"
		>
			{#if performance.dps < 0}
				{@html arrowDown}
			{:else}
				{@html arrowUp}
			{/if}
		</div>
		<div style="margin-left: -0.25rem;">)</div>
	</div>
{/if}
