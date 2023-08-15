<script lang="ts">
	import type { LayerCake } from 'layercake';
	import { getContext } from 'svelte';
	const { data, xGet, yGet, zGet } = getContext<LayerCake>('LayerCake');

	$: path = (values: unknown[]) => {
		return (
			'M' +
			values
				.map((d) => {
					return $xGet(d) + ',' + $yGet(d);
				})
				.join('L')
		);
	};
</script>

<g class="line-group">
	{#each $data as group}
		<path class="path-line" d={path(group.values)} stroke={$zGet(group)} />
	{/each}
</g>

<style>
	.path-line {
		fill: none;
		stroke-linejoin: round;
		stroke-linecap: round;
		stroke-width: 3px;
	}
</style>
