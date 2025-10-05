<script lang="ts">
	import Table, { cellComponent } from '$lib/components/table/Table.svelte';
	import Boss from '$lib/components/table/column/Boss.column.svelte';
	import CharacterDPS from '$lib/components/table/column/CharacterDPS.column.svelte';
	import CharacterHPS from '$lib/components/table/column/CharacterHPS.column.svelte';
	import Spec from '$lib/components/table/column/Spec.column.svelte';
	import { formatSecondsInterval } from '$lib/date';
	import { characterDps, characterHps, METRIC_TYPE, type MetricType } from '$lib/metrics';
	import { formatAvgItemLvl } from '$lib/number';
	import type { ColumnDef } from '@tanstack/svelte-table';
	import BossKillDetailLink from '../boss/[id=integer]/components/BossKillDetailLink.svelte';
	import type { PageData } from './$types';
	import { difficultyToString } from '$lib/model';
	import Link from '$lib/components/Link.svelte';
	import { links } from '$lib/links';

	export let data: PageData;

	const columnByStatsType: Record<MetricType, ColumnDef<unknown>[]> = {
		[METRIC_TYPE.DPS]: [],
		[METRIC_TYPE.HPS]: []
	};
	for (const stat of [
		{ type: METRIC_TYPE.DPS, value: data.byDPS },
		{ type: METRIC_TYPE.HPS, value: data.byHPS }
	]) {
		type T = (typeof stat.value)[0];
		const isDmg = stat.type === METRIC_TYPE.DPS;
		const columns: ColumnDef<T>[] = [
			{
				id: 'raid',
				accessorFn: (row) => row.raid.name,
				header: () => 'Raid',
				enableSorting: false
			},
			{
				id: 'boss',
				accessorFn: (row) => row.boss.name,
				header: () => 'Boss',
				cell: ({ row }) => {
					return cellComponent(Boss, {
						realm: data.realm,
						boss: row.original.boss,
						difficulty: data.difficulty
					});
				},
				enableSorting: false
			},
			{
				id: 'spec',
				accessorFn: (row) => row.spec,
				cell: ({ row }) => {
					return cellComponent(Spec, {
						realm: data.realm,
						spec: row.original.spec
					});
				},
				header: () => 'Spec',
				enableSorting: false
			},
			{
				id: 'character',
				accessorFn: (row) => row.ranks[0]!.name,
				header: () => 'Character',
				enableSorting: false
			},
			{
				id: 'valuePerSecond',
				accessorFn: (row) => {
					const r1 = row.ranks[0];
					if (r1) {
						return isDmg ? characterDps(r1) : characterHps(r1);
					}
					return null;
				},
				cell: ({ row }) => {
					const r1 = row.original.ranks[0];
					if (r1) {
						return isDmg
							? cellComponent(CharacterDPS, { character: r1 })
							: cellComponent(CharacterHPS, { character: r1 });
					}

					return 'N/A';
				},
				header: () => (isDmg ? 'DPS' : 'HPS'),
				enableSorting: false
			},

			{
				id: 'fightLength',
				accessorFn: (row) => row.ranks[0]?.boss_kills?.length ?? 0,
				cell: (info) => formatSecondsInterval(info.getValue() as number),
				header: () => 'Fight Length',
				enableSorting: false
			},

			{
				id: 'avgItemLvl',
				accessorFn: (row) => row.ranks[0]!.avg_item_lvl,
				cell: (info) => formatAvgItemLvl(info.getValue() as any),
				header: () => 'Avg iLvl',
				enableSorting: false
			},
			{
				id: 'detail',
				cell: (info) => {
					const bossKillId = info.row.original.ranks[0]!.boss_kills?.id;
					return cellComponent(BossKillDetailLink, { realm: data.realm, id: bossKillId });
				},
				header: () => 'Details',
				enableSorting: false
			}
		];
		columnByStatsType[stat.type] = columns as any as ColumnDef<unknown>[];
	}
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
<Table data={data.byDPS} columns={columnByStatsType[METRIC_TYPE.DPS]} />

<h2>Top HPS ranks {difficultyToString(data.expansion, data.difficulty)}</h2>
<Table data={data.byHPS} columns={columnByStatsType[METRIC_TYPE.HPS]} />
