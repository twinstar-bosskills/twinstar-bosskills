<script lang="ts">
	import type { LayerCake } from 'layercake';
	import { getContext } from 'svelte';

	const { data, z, zRange } = getContext<LayerCake>('LayerCake');
</script>

<div class="label-group">
	{#each $data as group, i}
		{@const color = $zRange[i] ?? 'black'}
		<div class="label">
			<div class="label-color" style="background: {color};" />
			<div>
				{$z(group)}
			</div>
		</div>
	{/each}
</div>

<style>
	.label-group {
		position: absolute;
		display: flex;
		right: 0;
		bottom: -40px;
	}
	.label {
		display: flex;
		align-items: center;
		font-size: 0.75rem;

		margin-right: 0.5rem;
	}
	.label-color {
		width: 12px;
		height: 12px;
		margin-right: 0.25rem;
	}
</style>
