<script lang="ts">
	import { page } from '$app/stores';
	import Icon from '$lib/components/Icon.svelte';
	import Link from '$lib/components/Link.svelte';
	import { links } from '$lib/links';
	import { Difficulty, TalentSpec, difficultyToString, isRaidDifficulty } from '$lib/model';
	import { formatNumber, formatValuePerSecond } from '$lib/number';
	import { STATS_TYPE_DMG } from '$lib/stats-type';
	import { getTalentSpecIconUrl } from '$lib/talent';
	import type { PageData } from './$types';

	export let data: PageData;
	function characterIsMe(character: string) {
		return character.toLowerCase() === data.character.toLowerCase();
	}
	const title = `Boss ${data.boss.name}`;

	let searchParams = new URLSearchParams($page.url.searchParams);
	const currentDifficulty = String(searchParams.get('difficulty') ?? Difficulty.DIFFICULTY_10_N);
	const currentSpec = searchParams.get('spec');

	const specs: { id: number; iconUrl: string; href: string; isActive: boolean }[] = [];
	for (const id of Object.values(TalentSpec)) {
		const isActive = currentSpec === String(id);
		searchParams.set('spec', String(id));
		specs.push({
			id,
			iconUrl: getTalentSpecIconUrl(id),
			href: `?${searchParams}`,
			isActive
		});
	}
	searchParams.delete('spec');
	const specResetHref = `?${searchParams}`;

	searchParams = new URLSearchParams($page.url.searchParams);
	const diffs: { id: number; label: string; href: string; isActive: boolean }[] = [];
	for (const id of Object.values(Difficulty)) {
		if (isRaidDifficulty(id)) {
			const isActive = currentDifficulty === String(id);
			searchParams.set('difficulty', String(id));
			diffs.push({
				id,
				label: difficultyToString(id),
				href: `?${searchParams}`,
				isActive
			});
		}
	}
	searchParams.delete('difficulty');
	const difficultyResetHref = `?${searchParams}`;
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>
<h1>{title}</h1>
<h2>Top stats by spec</h2>
<div>
	<ul>
		<li><Link style="display: flex;" href={difficultyResetHref}>Reset</Link></li>
		{#each diffs as { label, href, isActive }}
			<li class:active={isActive}>
				<div class:active={isActive}>
					<Link style="display: flex;" {href}>
						{label}
					</Link>
				</div>
			</li>
		{/each}
	</ul>
	<ul>
		<li><Link style="display: flex;" href={specResetHref}>Reset</Link></li>
		{#each specs as { id, iconUrl, href, isActive }}
			<li class:active={isActive}>
				<div class:active={isActive}>
					<Link style="display: flex;" {href}>
						<Icon src={iconUrl} label="Talent spec {id}" style="width: 24px; height: auto;" />
					</Link>
				</div>
			</li>
		{/each}
	</ul>
</div>
<div class="grid" style="--stats-length: {data.stats.length}">
	{#each data.stats as stat}
		<div>
			{#if stat.value.length > 0}
				{@const name = stat.type === STATS_TYPE_DMG ? 'Damage done' : 'Healing done'}
				{@const namePerSecond = stat.type === STATS_TYPE_DMG ? 'DPS' : 'HPS'}
				<h3>{stat.type === STATS_TYPE_DMG ? 'Top Damage done' : 'Top Healing done'}</h3>
				<table style="position: relative;">
					<thead>
						<tr>
							<th>Rank</th>
							<th>Character</th>
							<th>Spec</th>
							<th>{name}</th>
							<th>{namePerSecond}</th>
							<th>Details</th>
						</tr>
					</thead>
					<tbody>
						{#each stat.value as item, i}
							{@const isMe = characterIsMe(item.char.name)}
							{@const style = isMe ? 'font-weight: bold;' : ''}
							{@const amount = formatNumber(item.amount)}
							{@const amountPerSecond = formatValuePerSecond(item.amount, item.char.usefullTime)}
							{@const bossKillId = item.char.boss_kills?.id ?? ''}
							<tr>
								<td {style}>{i + 1}</td>
								<td {style}>
									<Link href={links.character(item.char.name)}>
										{isMe ? '>>> ' : ''}
										{item.char.name}
										{isMe ? ' <<<' : ''}
									</Link>
								</td>
								<td {style}>
									<Icon
										src={item.char.talentSpecIconUrl}
										label="Talent spec {item.char.talent_spec}"
										style="width: 16px; height: auto;"
									/>
								</td>
								<td {style}>{amount}</td>
								<td {style}>{amountPerSecond}</td>
								<td>
									{#if bossKillId !== ''}
										<Link href={links.bossKill(bossKillId)}>Detail</Link>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</div>
	{/each}
</div>

<style>
	div.active {
		border: 4px solid gold;
		border-radius: 6px;
	}
	li.active {
		border: 2px solid black;
		border-radius: 6px;
	}
	ul {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		margin-bottom: 0.5rem;
	}
	ul li {
		margin-right: 0.25rem;
	}
	.grid {
		display: grid;
		column-gap: 1rem;
		grid-template-columns: repeat(var(--stats-length, 2), max-content);
	}
</style>
