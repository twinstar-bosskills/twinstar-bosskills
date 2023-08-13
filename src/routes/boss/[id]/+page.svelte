<script lang="ts">
	import { STATS_TYPE_DMG } from '$lib/stats-type';
	import type { PageData } from './$types';

	export let data: PageData;

	const title = `Boss ${data.boss.name}`;
	const fmt = new Intl.NumberFormat();
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>
<h1>{title}</h1>
<div class="grid" style="--stats-length: {data.stats.length}">
	{#each data.stats as stat}
		<div>
			{#if stat.value.length > 0}
				<h2>{stat.type === STATS_TYPE_DMG ? 'Top Dmg done' : 'Top Healing done'}</h2>
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
								<td>
									<a href="/character/{item.guid}">
										{data.charactersByGUID[item.guid]?.name ?? 'Unknown'}
									</a>
								</td>
								<td>{item.talentSpec}</td>
								<td>{fmt.format(item.amount)}</td>
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
