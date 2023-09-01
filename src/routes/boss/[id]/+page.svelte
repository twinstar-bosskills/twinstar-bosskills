<script lang="ts">
	import { page } from '$app/stores';
	import Icon from '$lib/components/Icon.svelte';
	import Link from '$lib/components/Link.svelte';
	import TextColorError from '$lib/components/TextColorError.svelte';
	import TextColorSuccess from '$lib/components/TextColorSuccess.svelte';
	import TextColorWarning from '$lib/components/TextColorWarning.svelte';
	import BossPerformanceBoxChart from '$lib/components/echart/BossPerformanceBoxChart.svelte';
	import Table from '$lib/components/table/Table.svelte';
	import CharacterDps from '$lib/components/table/column/CharacterDPS.column.svelte';
	import CharacterHps from '$lib/components/table/column/CharacterHPS.column.svelte';
	import CharacterName from '$lib/components/table/column/CharacterName.column.svelte';
	import KilledAt from '$lib/components/table/column/KilledAt.column.svelte';
	import Spec from '$lib/components/table/column/Spec.column.svelte';
	import { formatCell } from '$lib/components/table/column/cell';
	import { formatSecondsInterval } from '$lib/date';
	import { characterDps, characterHps } from '$lib/metrics';
	import {
		Difficulty,
		TalentSpec,
		difficultyToString,
		isRaidDifficulty,
		talentSpecToString
	} from '$lib/model';
	import { getDifficultyFromUrl } from '$lib/search-params';
	import { STATS_TYPE_DMG, STATS_TYPE_HEAL, type StatsType } from '$lib/stats-type';
	import { getTalentSpecIconUrl } from '$lib/talent';
	import { flexRender, type ColumnDef } from '@tanstack/svelte-table';
	import type { PageData } from './$types';
	import BossKillDetailLink from './components/BossKillDetailLink.svelte';

	export let data: PageData;

	const title = `Boss ${data.boss.name}`;

	let searchParams = new URLSearchParams($page.url.searchParams);
	const currentDifficulty = String(getDifficultyFromUrl($page.url) ?? Difficulty.DIFFICULTY_10_N);
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

	const columnByStatsType: Record<StatsType | string, ColumnDef<unknown>[]> = {
		[STATS_TYPE_DMG]: [],
		[STATS_TYPE_HEAL]: []
	};
	for (const stat of data.stats) {
		type T = (typeof stat.value)[0];
		const isDmg = stat.type === STATS_TYPE_DMG;
		const columns: ColumnDef<T>[] = [
			{
				id: 'character',
				accessorFn: (row) => row.char,
				header: () => 'Character',
				cell: (info) => flexRender(CharacterName, { character: info.row.original.char })
			},
			{ id: 'rank', accessorFn: (_, i) => i + 1, header: () => 'Rank' },
			{
				id: 'spec',
				accessorFn: (row) => row.char.talent_spec,
				cell: ({ row }) => {
					const { original } = row;
					return flexRender(Spec, {
						character: original.char
					});
				},
				header: () => 'Spec'
			},
			{
				id: 'amount',
				accessorFn: (row) => row.amount,
				cell: formatCell,
				header: () => (isDmg ? 'Damage Done' : 'Healing Done')
			},
			{
				id: 'amountPerSecond',
				accessorFn: (row) => (isDmg ? characterDps(row.char) : characterHps(row.char)),
				cell: (info) =>
					isDmg
						? flexRender(CharacterDps, { character: info.row.original.char })
						: flexRender(CharacterHps, { character: info.row.original.char }),
				header: () => (isDmg ? 'DPS' : 'HPS')
			},
			{
				id: 'fightLength',
				accessorFn: (row) => row.char.boss_kills?.length ?? 0,
				cell: (info) => formatSecondsInterval(info.getValue() as number),
				header: () => 'Fight Length'
			},
			{
				id: 'killedAt',
				header: () => 'Killed',
				accessorFn: (row) => row.char.boss_kills?.time,
				cell: (info) => flexRender(KilledAt, { bosskill: info.row.original.char.boss_kills! })
			},
			{
				id: 'detail',
				cell: (info) => {
					const bossKillId = info.row.original.char.boss_kills?.id;
					return flexRender(BossKillDetailLink, { id: bossKillId });
				},
				header: () => 'Details',
				enableSorting: false
			}
		];
		columnByStatsType[stat.type] = columns as any as ColumnDef<unknown>[];
	}
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>
<h1>{title}</h1>
<p>
	{data.boss.name} ({difficultyToString(currentDifficulty)}) was killed
	<TextColorSuccess>{data.kw.kills.total}</TextColorSuccess> times by raiders and wiped them <TextColorError
		>{data.kw.wipes.total}</TextColorError
	> times (<TextColorError>{data.kw.wipes.avg}</TextColorError>
	times on average).
</p>
<p>
	You have <TextColorSuccess>{data.kw.kills.chance}%</TextColorSuccess> chance to make a kill and <TextColorError
		>{data.kw.wipes.chance}%</TextColorError
	> chance to wipe.
</p>
<p>
	<TextColorSuccess>Fastest</TextColorSuccess> kill took
	<TextColorSuccess>{formatSecondsInterval(data.kw.fightDuration.min)}</TextColorSuccess>,
	<TextColorWarning>average</TextColorWarning> kill took
	<TextColorWarning>{formatSecondsInterval(data.kw.fightDuration.avg)}</TextColorWarning> and
	<TextColorError>slowest</TextColorError> kill took
	<TextColorError>{formatSecondsInterval(data.kw.fightDuration.max)}</TextColorError>
</p>

<h2>Top stats by spec</h2>
<div>
	<ul>
		<li>
			<Link data-sveltekit-reload style="display: flex;" href={difficultyResetHref}>Reset</Link>
		</li>
		{#each diffs as { label, href, isActive }}
			<li class:active={isActive}>
				<div class:active={isActive}>
					<Link data-sveltekit-reload style="display: flex;" {href}>
						{label}
					</Link>
				</div>
			</li>
		{/each}
	</ul>
	<ul>
		<li><Link data-sveltekit-reload style="display: flex;" href={specResetHref}>Reset</Link></li>
		{#each specs as { id, iconUrl, href, isActive }}
			<li class:active={isActive}>
				<div class:active={isActive}>
					<Link data-sveltekit-reload style="display: flex;" {href}>
						<Icon src={iconUrl} label={talentSpecToString(id)} style="width: 24px; height: 24px;" />
					</Link>
				</div>
			</li>
		{/each}
	</ul>
</div>
<div class="flex">
	{#each data.stats as stat}
		<div>
			{#if stat.value.length > 0}
				{@const isDmg = stat.type === STATS_TYPE_DMG}
				<h3>{isDmg ? 'Top Damage Done' : 'Top Healing Done'}</h3>
				<Table
					data={stat.value}
					columns={columnByStatsType[stat.type]}
					sorting={[{ id: 'amount', desc: true }]}
				/>
			{/if}
		</div>
	{/each}
</div>
<h2>DPS Talent Specialization Distribution</h2>
<BossPerformanceBoxChart
	width={data.windowInnerWidth}
	field="dps"
	aggregated={data.aggregated.dps}
/>

<style>
	ul li div {
		padding: 0.25rem;
	}
	ul li div.active {
		border: 4px solid var(--color-primary);
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
	.flex {
		display: flex;
		flex-wrap: wrap;
	}
	.flex div {
		margin-right: 1rem;
		overflow: auto;
	}
	:global(.flex table) {
		max-height: 75vh;
	}
	@media (max-width: 720px) {
		:global(.flex table) {
			max-height: 500px;
		}
	}
</style>
