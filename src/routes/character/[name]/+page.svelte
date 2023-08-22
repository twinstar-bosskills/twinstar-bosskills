<script lang="ts">
	import Table from '$lib/components/table/Table.svelte';
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
	import { flexRender, type ColumnDef } from '@tanstack/svelte-table';
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
			cell: (info) => flexRender(Boss, { bosskill: info.row.original.boss_kills })
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
				return flexRender(Spec, {
					character: original
				});
			},
			header: () => 'Spec'
		},
		{
			id: 'dps',
			accessorFn: (row) => characterDps(row),
			cell: (info) => flexRender(CharacterDps, { character: info.row.original }),
			header: () => 'DPS'
		},
		{
			id: 'hps',
			accessorFn: (row) => characterHps(row),
			header: () => 'HPS',
			cell: (info) => flexRender(CharacterHps, { character: info.row.original })
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
			cell: (info) => flexRender(KilledAt, { bosskill: info.row.original.boss_kills! })
		},
		{
			id: 'fightDetails',
			header: () => 'Fight Details',
			cell: (info) => flexRender(FightDetails, { bosskill: info.row.original.boss_kills! }),
			enableSorting: false
		}
	];
	const columnsUnknown = columns as any as ColumnDef<unknown>[];
</script>

<svelte:head>
	<title>Character {data.name}</title>
</svelte:head>

<h1>
	Character {data.name}
</h1>
<LinkExternal
	style="display: inline-block;margin: 0.5rem 0;"
	href={links.twinstarArmory(data.name)}
>
	Armory
</LinkExternal>

<div>
	<!-- <table>
		<thead>
			<tr>
				<th>Boss</th>
				<th>Difficulty</th>
				<th>Spec</th>
				<th>DPS</th>
				<th>HPS</th>
				<th>Fight Length</th>
				<th>Avg iLvl</th>
				<th>Killed</th>
				<th>Fight Details</th>
			</tr>
		</thead>
		<tbody>
			{#each data.bosskills as character}
				{@const bosskill = character.boss_kills}
				{#if bosskill}
					<tr>
						<td>
							<Link href={links.boss(bosskill.entry)}>
								{data.bossById[bosskill.entry]?.name ?? bosskill.entry}
							</Link>
						</td>
						<td>{bosskill.difficulty}</td>
						<td>
							<Icon src={character.talentSpecIconUrl} label={String(character.talent_spec)} />
						</td>
						<td>{formatValuePerSecond(character.dmgDone, bosskill.length)}</td>
						<td>{formatValuePerSecond(character.healingDone, bosskill.length)}</td>
						<td>{formatSecondsInterval(bosskill.length)}</td>
						<td>{character.avg_item_lvl}</td>
						<td>{formatTzLocalized(bosskill.time)} ({distanceTzNow(bosskill.time)} ago)</td>

						<td>
							<Link href={links.bossKill(bosskill.id)}>Detail</Link>
							<a href="https://mop-twinhead.twinstar.cz/?boss-kill={bosskill.id}">Twinhead</a>
						</td>
					</tr>
				{/if}
			{/each}
		</tbody>
	</table> -->
	<Table data={bosskills} columns={columnsUnknown} sorting={[{ id: 'dps', desc: true }]} />
</div>

<style>
	h1 {
		margin-bottom: 0;
	}
</style>
