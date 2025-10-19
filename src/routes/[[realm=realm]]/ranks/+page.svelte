<script lang="ts">
	import Link from '$lib/components/Link.svelte';
	import Table, { cellComponent } from '$lib/components/table/Table.svelte';
	import CharacterDPS from '$lib/components/table/column/CharacterDPS.column.svelte';
	import CharacterHPS from '$lib/components/table/column/CharacterHPS.column.svelte';
	import CharacterName from '$lib/components/table/column/CharacterName.column.svelte';
	import Class from '$lib/components/table/column/Class.column.svelte';
	import { formatSecondsInterval } from '$lib/date';
	import { links } from '$lib/links';
	import { characterDps, characterHps, METRIC_TYPE, type MetricType } from '$lib/metrics';
	import { difficultyToString } from '$lib/model';
	import { formatAvgItemLvl, formatNumber } from '$lib/number';
	import type { ColumnDef } from '@tanstack/svelte-table';
	import BossKillDetailLink from '../boss/[id=integer]/components/BossKillDetailLink.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	const dpsTableStyle =
		'--grid-template-columns: minmax(max-content, 1fr) min-content minmax(max-content, 1fr) min-content minmax(max-content, 1fr) min-content minmax(max-content, 1fr)';
	const hpsTableStyle =
		'--grid-template-columns: minmax(max-content, 1fr) min-content repeat(2, minmax(max-content, 1fr)) min-content minmax(max-content, 1fr)';
	const columnByStatsType = ({
		boss,
		metric
	}: {
		boss: (typeof data.byDPS)['raids'][0]['bosses'][0];
		metric: MetricType;
	}): ColumnDef<unknown>[] => {
		type T = (typeof data.byDPS.ranks)['0']['0'][0];
		const isDmg = metric === METRIC_TYPE.DPS;
		const columns: (ColumnDef<T> | undefined)[] = [
			{
				id: 'character',
				accessorFn: (row) => row.characters[0]!.name,
				header: () => 'Character',
				cell: ({ row, table }) => {
					const rows = table.getPreSortedRowModel().rows;
					const index = rows.findIndex((r) => r.id === row.id) ?? null;
					let rank = undefined;
					if (index !== null) {
						rank = index + 1;
					}
					return cellComponent(CharacterName, {
						realm: data.realm,
						character: row.original.characters[0]!,
						rank
					});
				}
			},
			{
				id: 'class',
				accessorFn: (row) => row.spec,
				cell: ({ row }) => {
					return cellComponent(Class, {
						realm: data.realm,
						character: row.original.characters[0],
						talentSpecHref: links.bossHistory(data.realm, boss.remoteId, {
							difficulty: data.difficulty,
							raidlock: data.raidlock,
							spec: row.original.spec
						})
					});
				},
				header: () => 'Class',
				enableSorting: false
			},
			{
				id: 'valuePerSecond',
				accessorFn: (row) => {
					const r1 = row.characters[0];
					if (r1) {
						return isDmg ? characterDps(r1) : characterHps(r1);
					}
					return null;
				},
				cell: ({ row }) => {
					const r1 = row.original.characters[0];
					if (r1) {
						return isDmg
							? cellComponent(CharacterDPS, { character: r1, effectivity: r1.dpsEffectivity })
							: cellComponent(CharacterHPS, { character: r1 });
					}

					return 'N/A';
				},
				header: () => (isDmg ? 'DPS' : 'HPS')
			},
			isDmg
				? {
						id: 'effectivity',
						accessorFn: (row) => {
							const r1 = row.characters[0];
							if (r1) {
								return isDmg ? r1.dpsEffectivity : null;
							}
							return null;
						},
						cell: ({ getValue }) => {
							const dpsEffectivity = getValue<number | null>();
							if (typeof dpsEffectivity === 'number') {
								return formatNumber(dpsEffectivity);
							}

							return 'N/A';
						},
						header: () => 'Effectivity'
				  }
				: undefined,
			{
				id: 'fightLength',
				accessorFn: (row) => row.characters[0]?.boss_kills?.length ?? 0,
				cell: (info) => formatSecondsInterval(info.getValue() as number),
				header: () => 'Fight Length'
			},

			{
				id: 'avgItemLvl',
				accessorFn: (row) => row.characters[0]!.avg_item_lvl,
				cell: (info) => formatAvgItemLvl(info.getValue() as any),
				header: () => 'iLvl'
			},
			{
				id: 'detail',
				cell: (info) => {
					const bossKillId = info.row.original.characters[0]!.boss_kills?.id;
					return cellComponent(BossKillDetailLink, { realm: data.realm, id: bossKillId });
				},
				header: () => 'Details',
				enableSorting: false
			}
		];
		return columns.filter(Boolean) as any as ColumnDef<unknown>[];
	};
</script>

<svelte:head>
	<title>Ranks</title>
</svelte:head>
<h1>Ranks</h1>
<p>
	Top character by spec by for raid lock {data.raidLockStart.toLocaleDateString()} - {data.raidLockEnd.toLocaleDateString()}
	<Link href={links.ranks(data.realm, { raidlock: data.raidlock + 1 })}>(see previous)</Link>
</p>

<h2>Top DPS ranks {difficultyToString(data.expansion, data.difficulty)}</h2>
{#each data.byDPS.raids as raid}
	<h3>{raid.name}</h3>
	{#each raid.bosses as boss}
		{@const tableData = data.byDPS.ranks?.[raid.id]?.[boss.id] ?? []}
		{#if tableData.length > 0}
			<h4>
				{raid.name} -
				<Link href={links.boss(data.realm, boss.remoteId, { difficulty: data.difficulty })}>
					{boss.name}
				</Link>
			</h4>
			<Table
				data={tableData}
				columns={columnByStatsType({ boss, metric: METRIC_TYPE.DPS })}
				style={dpsTableStyle}
				sorting={[{ id: 'valuePerSecond', desc: true }]}
			/>
		{/if}
	{/each}
{/each}

<h2>Top HPS ranks {difficultyToString(data.expansion, data.difficulty)}</h2>
{#each data.byHPS.raids as raid}
	<h3>{raid.name}</h3>
	{#each raid.bosses as boss}
		{@const tableData = data.byHPS.ranks?.[raid.id]?.[boss.id] ?? []}
		{#if tableData.length > 0}
			<h4>
				{raid.name} -
				<Link href={links.boss(data.realm, boss.remoteId, { difficulty: data.difficulty })}>
					{boss.name}
				</Link>
			</h4>
			<Table
				data={tableData}
				columns={columnByStatsType({ boss, metric: METRIC_TYPE.HPS })}
				style={hpsTableStyle}
				sorting={[{ id: 'valuePerSecond', desc: true }]}
			/>
		{/if}
	{/each}
{/each}
