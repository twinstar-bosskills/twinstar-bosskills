<script lang="ts">
	import Table, { cellComponent } from '$lib/components/table/Table.svelte';
	import Boss from '$lib/components/table/column/Boss.column.svelte';
	import CharacterDps from '$lib/components/table/column/CharacterDPS.column.svelte';
	import CharacterHps from '$lib/components/table/column/CharacterHPS.column.svelte';
	import FightDetails from '$lib/components/table/column/FightDetails.column.svelte';
	import KilledAt from '$lib/components/table/column/KilledAt.column.svelte';
	import Spec from '$lib/components/table/column/Spec.column.svelte';
	import { formatSecondsInterval } from '$lib/date';

	import LinkExternal from '$lib/components/LinkExternal.svelte';
	import { links } from '$lib/links';
	import { characterDps, characterHps } from '$lib/metrics';
	import { formatAvgItemLvl } from '$lib/number';
	import type { ColumnDef } from '@tanstack/svelte-table';
	import type { PageData } from './$types';

	export let data: PageData;

	type T = (typeof bosskills)[0];
	const bosskills = data.bosskills.filter((v) => !!v.boss_kills);

	const columns: ColumnDef<T>[] = [
		{
			id: 'boss',
			accessorFn: (row) => {
				const entry = row.boss_kills?.entry ?? 0;
				return data.bossById[entry]?.name ?? entry;
			},
			header: () => 'Boss',
			cell: (info) => cellComponent(Boss, { bosskill: info.row.original.boss_kills })
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
				let performance = null;
				if (boskillId !== null) {
					performance = data.performance.byRemoteId[boskillId];
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
				let performance = null;
				if (boskillId !== null) {
					performance = data.performance.byRemoteId[boskillId];
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
			accessorFn: (row) => row.boss_kills?.time,
			cell: (info) => cellComponent(KilledAt, { bosskill: info.row.original.boss_kills! })
		},
		{
			id: 'fightDetails',
			header: () => 'Fight Details',
			cell: (info) => cellComponent(FightDetails, { bosskill: info.row.original.boss_kills! }),
			enableSorting: false
		}
	];
	const columnsUnknown = columns as any as ColumnDef<unknown>[];
</script>

<svelte:head>
	<title>Character {data.name}</title>
</svelte:head>

<div class="title">
	<h1>
		Character {data.name}
	</h1>
	<div class="link">
		<LinkExternal href={links.twinstarArmory(data.name)}>Armory</LinkExternal>
	</div>
</div>

<div class="table">
	<Table data={bosskills} columns={columnsUnknown} sorting={[{ id: 'killedAt', desc: true }]} />
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
