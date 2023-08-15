<script lang="ts">
	import { formatNumber } from '$lib/number';
	import { STATS_TYPE_DMG } from '$lib/stats-type';
	import type { PageData } from './$types';

	export let data: PageData;

	const title = `Boss ${data.boss.name}`;
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>
<h1>{title}</h1>
<h2>Top stats by spec (last 100 kills)</h2>
<div class="grid" style="--stats-length: {data.stats.length}">
	{#each data.stats as stat}
		<div>
			{#if stat.value.length > 0}
				<h3>{stat.type === STATS_TYPE_DMG ? 'Top Dmg done' : 'Top Healing done'}</h3>
				<table>
					<thead>
						<tr>
							<th>Player</th>
							<th>Talent spec</th>
							<th>Amount</th>
						</tr>
					</thead>
					<tbody>
						{#each stat.value as item}
							<tr>
								<td>{item.player.name}</td>
								<td>
									<img
										style="width: 16px;"
										src={item.player.talentSpecIconUrl}
										title={`Talent spec ${item.player.talent_spec}`}
										alt="Icon for talent spec {item.player.talent_spec}"
									/>
								</td>
								<td>{formatNumber(item.amount)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</div>
	{/each}
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(var(--stats-length, 2), 1fr);
	}
</style>
