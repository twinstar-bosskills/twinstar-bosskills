<script lang="ts">
	import { page } from '$app/stores';
	import Link from '$lib/components/Link.svelte';
	import Table, { cellComponent } from '$lib/components/table/Table.svelte';
	import Boss from '$lib/components/table/column/Boss.column.svelte';
	import CharacterDps from '$lib/components/table/column/CharacterDPS.column.svelte';
	import CharacterHps from '$lib/components/table/column/CharacterHPS.column.svelte';
	import FightDetails from '$lib/components/table/column/FightDetails.column.svelte';
	import KilledAt from '$lib/components/table/column/KilledAt.column.svelte';
	import Spec from '$lib/components/table/column/Spec.column.svelte';
	import { formatSecondsInterval, fromServerTime } from '$lib/date';

	import LinkExternal from '$lib/components/LinkExternal.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import { links } from '$lib/links';
	import { characterDps, characterHps } from '$lib/metrics';
	import { formatAvgItemLvl } from '$lib/number';
	import { getPageFromURL, getPageSizeFromURL } from '$lib/pagination';
	import type { ColumnDef } from '@tanstack/svelte-table';
	import type { PageData } from './$types';

	let pageSize = getPageSizeFromURL($page.url, 20);
	let page_ = getPageFromURL($page.url);

	export let data: PageData;

	const name = data.name;
	type T = (typeof bosskills)[0];
	const bosskills = data.bosskills.data.filter((v) => !!v.boss_kills);

	const columns: ColumnDef<T>[] = [
		{
			id: 'boss',
			accessorFn: (row) => {
				const entry = row.boss_kills?.entry ?? 0;
				return data.bossNameById[entry] ?? entry;
			},
			header: () => 'Boss',
			cell: (info) => {
				const bossId = info.row.original.boss_kills?.entry ?? 0;
				return cellComponent(Boss, {
					realm: data.realm,
					bosskill: {
						...info.row.original.boss_kills,
						creature_name: data.bossNameById[bossId] ?? bossId
					}
				});
			}
		},
		{
			id: 'difficulty',
			accessorFn: (row) => row.boss_kills?.difficulty,
			header: () => 'Difficulty'
		},
		{
			id: 'spec',
			accessorFn: (row) => row.talent_spec,
			cell: ({ row }) => {
				const { original } = row;
				return cellComponent(Spec, {
					realm: data.realm,
					character: original
				});
			},

			header: () => 'Spec'
		},
		{
			id: 'dps',
			accessorFn: (row) => characterDps(row),
			cell: (info) => {
				const boskillId = info.row.original.boss_kills?.id ?? null;
				const mode = info.row.original.boss_kills?.mode ?? null;
				let performance = null;
				if (boskillId !== null && mode !== null) {
					performance = data.performanceTrends?.[boskillId]?.[mode] ?? null;
				}
				return cellComponent(CharacterDps, { character: info.row.original, performance });
			},
			header: () => 'DPS'
		},
		{
			id: 'hps',
			accessorFn: (row) => characterHps(row),
			header: () => 'HPS',
			cell: (info) => {
				const boskillId = info.row.original.boss_kills?.id ?? null;
				const mode = info.row.original.boss_kills?.mode ?? null;
				let performance = null;
				if (boskillId !== null && mode !== null) {
					performance = data.performanceTrends?.[boskillId]?.[mode] ?? null;
				}
				return cellComponent(CharacterHps, { character: info.row.original, performance });
			}
		},
		{
			id: 'fightLength',
			accessorFn: (row) => row.boss_kills?.length ?? 0,
			cell: (info) => formatSecondsInterval(info.getValue() as number),
			header: () => 'Fight Length'
		},
		{
			id: 'avgItemLvl',
			accessorFn: (row) => row.avg_item_lvl,
			cell: (info) => formatAvgItemLvl(info.row.original.avg_item_lvl),
			header: () => 'Avg iLvl'
		},
		{
			id: 'killedAt',
			header: () => 'Killed',
			accessorFn: (row) => fromServerTime(row.boss_kills!.time),
			cell: (info) => cellComponent(KilledAt, { bosskill: info.row.original.boss_kills! })
		},
		{
			id: 'fightDetails',
			header: () => 'Fight Details',
			cell: (info) =>
				cellComponent(FightDetails, { realm: data.realm, bosskill: info.row.original.boss_kills! }),
			enableSorting: false
		}
	];
	const columnsUnknown = columns as any as ColumnDef<unknown>[];
</script>

<svelte:head>
	<title>{name}'s recent kills time</title>
</svelte:head>

<div class="title">
	<h1>
		{name}'s recent kills
	</h1>
	<div>
		<Link href={links.characterPerformance(data.realm, name)}>Performance</Link>
	</div>
	<div>
		<LinkExternal href={links.twinstarArmory(data.realm, name)}>Armory</LinkExternal>
	</div>
</div>

<div class="table">
	<Table data={bosskills} columns={columnsUnknown} sorting={[{ id: 'killedAt', desc: true }]}>
		<svelte:fragment slot="pagination">
			<Pagination
				path={links.character(data.realm, data.name)}
				searchParams={$page.url.searchParams}
				page={page_}
				{pageSize}
				totalItems={data.bosskills.total}
			/>
		</svelte:fragment>
	</Table>
</div>

<style>
	.title {
		margin: 1rem 0;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		column-gap: 1rem;
		row-gap: 0.5rem;
	}
	.title h1 {
		margin: 0;
	}
</style>
