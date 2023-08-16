<script lang="ts">
	import { page } from '$app/stores';
	import Icon from '$lib/components/Icon.svelte';
	import Link from '$lib/components/Link.svelte';
	import { Difficulty, TalentSpec, difficultyToString, isRaidDifficulty } from '$lib/model';
	import { formatNumber } from '$lib/number';
	import { STATS_TYPE_DMG } from '$lib/stats-type';
	import { getTalentSpecIconUrl } from '$lib/talent';
	import type { PageData } from './$types';

	export let data: PageData;
	function characterIsMe(player: string) {
		return player.toLowerCase() === data.character.toLowerCase();
	}
	const title = `Boss ${data.boss.name}`;

	let searchParams = new URLSearchParams($page.url.searchParams);
	const specs: { id: number; iconUrl: string; href: string }[] = [];
	for (const id of Object.values(TalentSpec)) {
		searchParams.set('spec', String(id));
		specs.push({
			id,
			iconUrl: getTalentSpecIconUrl(id),
			href: `?${searchParams}`
		});
	}

	searchParams = new URLSearchParams($page.url.searchParams);
	const diffs: { id: number; label: string; href: string }[] = [];
	for (const id of Object.values(Difficulty)) {
		if (isRaidDifficulty(id)) {
			searchParams.set('difficulty', String(id));
			diffs.push({
				id,
				label: difficultyToString(id),
				href: `?${searchParams}`
			});
		}
	}
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>
<h1>{title}</h1>
<h2>Top stats by spec (last 100 kills)</h2>
<ul class="specs">
	{#each diffs as { label, href }}
		<li>
			<Link {href}>
				{label}
			</Link>
		</li>
	{/each}
</ul>
<ul class="specs">
	{#each specs as { id, iconUrl, href }}
		<li>
			<Link {href}>
				<Icon src={iconUrl} label="Talent spec {id}" style="width: 24px; height: auto;" />
			</Link>
		</li>
	{/each}
</ul>
<div class="grid" style="--stats-length: {data.stats.length}">
	{#each data.stats as stat}
		<div>
			{#if stat.value.length > 0}
				<h3>{stat.type === STATS_TYPE_DMG ? 'Top Dmg done' : 'Top Healing done'}</h3>
				<table style="position: relative;">
					<thead>
						<tr>
							<th>Rank</th>
							<th>Player</th>
							<th>Spec</th>
							<th>Amount</th>
						</tr>
					</thead>
					<tbody>
						{#each stat.value as item, i}
							{@const isMe = characterIsMe(item.player.name)}
							{@const style = isMe ? 'font-weight: bold;' : ''}
							<tr>
								<td {style}>{i + 1}</td>
								<td {style}>
									{isMe ? '>>> ' : ''}
									{item.player.name}
									{isMe ? ' <<<' : ''}
								</td>
								<td {style}>
									<Icon
										src={item.player.talentSpecIconUrl}
										label="Talent spec {item.player.talent_spec}"
										style="width: 16px; height: auto;"
									/>
								</td>
								<td {style}>{formatNumber(item.amount)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</div>
	{/each}
</div>

<style>
	.specs {
		display: flex;
	}
	.specs li {
		margin-right: 0.25rem;
	}
	.grid {
		display: grid;
		column-gap: 1rem;
		grid-template-columns: repeat(var(--stats-length, 2), max-content);
	}
</style>
