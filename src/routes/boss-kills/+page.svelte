<script lang="ts">
	import { page } from '$app/stores';
	import Pagination from '$lib/components/Pagination.svelte';
	import Table from '$lib/components/table/Table.svelte';
	import Boss from '$lib/components/table/column/Boss.column.svelte';
	import FightDetails from '$lib/components/table/column/FightDetails.column.svelte';
	import Guild from '$lib/components/table/column/Guild.column.svelte';
	import KilledAt from '$lib/components/table/column/KilledAt.column.svelte';
	import { formatSecondsInterval } from '$lib/date';
	import { links } from '$lib/links';
	import { getPageFromURL, getPageSizeFromURL } from '$lib/paginations';
	import { flexRender, type ColumnDef } from '@tanstack/svelte-table';
	import type { PageData } from './$types';

	let pageSize = getPageSizeFromURL($page.url);
	let page_ = getPageFromURL($page.url);

	export let data: PageData;

	type T = (typeof data.latest.data)[0];
	const columns: ColumnDef<T>[] = [
		{
			id: 'boss',
			accessorFn: (row) => row.creature_name ?? row.entry,
			header: () => 'Boss',
			cell: (info) => flexRender(Boss, { bosskill: info.row.original })
		},
		{
			id: 'raid',
			accessorFn: (row) => row.map,
			header: () => 'Raid'
		},
		{
			id: 'difficulty',
			accessorFn: (row) => row.difficulty,
			header: () => 'Difficulty'
		},
		{
			id: 'guild',
			accessorFn: (row) => row.guild,
			cell: ({ row }) => {
				const { original } = row;
				return flexRender(Guild, {
					bosskill: original
				});
			},
			header: () => 'Guild'
		},
		// {
		// 	id: 'dps',
		// 	accessorFn: (row) => characterDps(row),
		// 	cell: (info) => flexRender(CharacterDps, { character: info.row.original }),
		// 	header: () => 'DPS'
		// },
		// {
		// 	id: 'hps',
		// 	accessorFn: (row) => characterHps(row),
		// 	header: () => 'HPS',
		// 	cell: (info) => flexRender(CharacterHps, { character: info.row.original })
		// },
		{
			id: 'fightLength',
			accessorFn: (row) => row.length ?? 0,
			cell: (info) => formatSecondsInterval(info.getValue() as number),
			header: () => 'Fight Length'
		},

		{
			id: 'killedAt',
			header: () => 'Killed',
			accessorFn: (row) => row.time,
			cell: (info) => flexRender(KilledAt, { bosskill: info.row.original })
		},
		{
			id: 'fightDetails',
			header: () => 'Fight Details',
			cell: (info) => flexRender(FightDetails, { bosskill: info.row.original }),
			enableSorting: false
		}
	];
	const columnsUnknown = columns as any as ColumnDef<unknown>[];
</script>

<svelte:head>
	<title>Latest Bosskills</title>
</svelte:head>
<h1>Latest Bosskills</h1>
<div>
	<Table
		data={data.latest.data}
		columns={columnsUnknown}
		sorting={[{ id: 'killedAt', desc: true }]}
	>
		<svelte:fragment slot="pagination">
			<Pagination path={links.BOSS_KILLS} page={page_} {pageSize} totalItems={data.latest.total} />
		</svelte:fragment>
	</Table>
	<!-- <table>
		<thead>
			<tr>
				<th>Boss</th>
				<th>Raid</th>
				<th>Difficulty</th>
				<th>Guild</th>
				<th>Fight Length</th>
				<th>Killed</th>
				<th>Details</th>
			</tr>
		</thead>
		<tbody>
			{#each data.latest.data as bosskill}
				<tr>
					<td>
						<Link href={links.boss(bosskill.entry)}>
							{bosskill.creature_name}
						</Link>
					</td>
					<td>{bosskill.map}</td>
					<td>{bosskill.difficulty}</td>
					<td>{bosskill.guild == '' ? `Mixed group <${bosskill.realm}>` : bosskill.guild}</td>
					<td>{formatSecondsInterval(bosskill.length)}</td>
					<td><KilledAt {bosskill} /></td>

					<td>
						<Link href={links.bossKill(bosskill.id)}>Detail</Link>
						<LinkExternal href={links.twinstarBossKill(bosskill.id)}>Twinhead</LinkExternal>
					</td>
				</tr>
			{/each}
		</tbody>
		<tfoot>
			<tr>
				<td colspan="7">
					<Pagination
						path={links.BOSS_KILLS}
						page={page_}
						{pageSize}
						totalItems={data.latest.total}
					/>
				</td>
			</tr>
		</tfoot>
	</table> -->
</div>
