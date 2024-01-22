<script lang="ts">
	import arrowDown from '$lib/assets/icons/arrow-down.svg?raw';
	import arrowUp from '$lib/assets/icons/arrow-up.svg?raw';
	import { characterHps } from '$lib/metrics';

	import { formatNumber } from '$lib/number';
	import type { BosskillCharacter } from '$lib/server/api/schema';
	export let character: BosskillCharacter;
	export let fightLength: number | undefined = undefined;
	export let performance: { hps: number } | undefined | null = undefined;

	$: hps = characterHps(character, fightLength);
</script>

{formatNumber(hps)}
{#if performance && hps > 0}
	<div
		style="display: inline-flex; margin-left: 0.25rem;"
		title="Compared to previous kill with same difficulty"
	>
		({performance.hps.toLocaleString()}%
		<div
			style="height: 1rem; color: var({performance.hps < 0 ? '--color-error' : '--color-success'});"
		>
			{#if performance.hps < 0}
				{@html arrowDown}
			{:else}
				{@html arrowUp}
			{/if}
		</div>
		<div style="margin-left: -0.25rem;">)</div>
	</div>
{/if}
