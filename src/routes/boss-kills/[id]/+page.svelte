<script lang="ts">
	import { quality } from '$lib/css-vars';
	import type { Item } from '$lib/server/db';
	import type { PageData } from './$types';

	export let data: PageData;

	let showTooltipById: Record<Item['id'], boolean> = {};
	function showTooltip(id: number) {
		showTooltipById[id] = true;
	}
	function hideTooltip(id: number) {
		showTooltipById[id] = false;
	}
</script>

<h1>Boss Kill {data.bosskill.id}</h1>
<div class="grid">
	<div>
		<dl>
			<dt>Boss</dt>
			<dd>{data.bosskill.entry}</dd>

			<dt>Raid</dt>
			<dd>{data.bosskill.map}</dd>

			<dt>Guild</dt>
			<dd>{data.bosskill.guild}</dd>

			<dt>Realm</dt>
			<dd>{data.bosskill.realm}</dd>

			<dt>Killed at</dt>
			<dd>{data.bosskill.time}</dd>

			<dt>Wipes</dt>
			<dd>{data.bosskill.wipes}</dd>

			<dt>Deaths</dt>
			<dd>{data.bosskill.deaths}</dd>

			<dt>Fight Length</dt>
			<dd>{data.bosskill.length}</dd>

			<dt>Ressurects</dt>
			<dd>{data.bosskill.ressUsed}</dd>
		</dl>
	</div>

	<div>
		<h2>Boss Loot</h2>
		<div role="table">
			{#each data.items as item}
				<div
					tabindex="0"
					role="row"
					class="item"
					style="border: 2px solid var({quality(item.quality)})"
					on:mouseover={() => showTooltip(item.id)}
					on:focus={() => showTooltip(item.id)}
					on:mouseout={() => hideTooltip(item.id)}
					on:blur={() => hideTooltip(item.id)}
				>
					<img src={item.iconUrl} alt="Icon of {item.name}" width="36" height="36" />
					{item.name}
				</div>

				{@const tooltip = data.tooltips[item.id]}
				{#if tooltip && showTooltipById[item.id]}
					<div class="tooltip" style="border: 2px solid var({quality(item.quality)})">
						<!-- TODO(security): iframe this -->
						<!-- https://stackoverflow.com/questions/9975810/make-iframe-automatically-adjust-height-according-to-the-contents-without-using -->
						{@html tooltip.tooltip}
					</div>
				{/if}
			{/each}
		</div>
	</div>
</div>

<h2>Fight timeline</h2>
<div>TODO</div>

<h2>Stats</h2>
<div>TODO</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		column-gap: 1rem;
	}
	.item {
		display: flex;
		align-items: center;
	}
	.item img {
		width: 36px;
		height: 36px;
	}
	.tooltip {
		position: absolute;
		background: white;
	}
</style>
