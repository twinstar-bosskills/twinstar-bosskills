<script lang="ts">
	import { page } from '$app/stores';
	import Pagination from '$lib/components/Pagination.svelte';
	import FilterForm from '$lib/components/form/FilterForm.svelte';
	import Table, { cellComponent } from '$lib/components/table/Table.svelte';
	import Boss from '$lib/components/table/column/Boss.column.svelte';
	import FightDetails from '$lib/components/table/column/FightDetails.column.svelte';
	import Guild from '$lib/components/table/column/Guild.column.svelte';
	import KilledAt from '$lib/components/table/column/KilledAt.column.svelte';
	import { formatSecondsInterval, fromServerTime } from '$lib/date';
	import { links } from '$lib/links';
	import { getPageFromURL, getPageSizeFromURL } from '$lib/pagination';
	import type { ColumnDef } from '@tanstack/svelte-table';
	import type { PageData } from './$types';

	export let data: PageData;

	let pageSize = getPageSizeFromURL($page.url);
	let page_ = getPageFromURL($page.url);
	const bosses = data.bossNameByRemoteId;

	type T = (typeof data.latest.data)[0];
	const columns: ColumnDef<T>[] = [
		{
			id: 'boss',
			accessorFn: (row) => bosses[row.entry] ?? row.creature_name ?? row.entry,
			header: () => 'Boss',
			cell: (info) =>
				cellComponent(Boss, {
					realm: data.realm,
					bosskill: {
						...info.row.original,
						creature_name: bosses[info.row.original.entry] ?? info.row.original.creature_name
					}
				})
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
				return cellComponent(Guild, {
					bosskill: original
				});
			},
			header: () => 'Guild'
		},
		{
			id: 'fightLength',
			accessorFn: (row) => row.length ?? 0,
			cell: (info) => formatSecondsInterval(info.getValue() as number),
			header: () => 'Fight Length'
		},
		{
			id: 'killedAt',
			header: () => 'Killed',
			accessorFn: (row) => fromServerTime(row.time),
			cell: (info) => cellComponent(KilledAt, { bosskill: info.row.original })
		},
		{
			id: 'fightDetails',
			header: () => 'Fight Details',
			cell: (info) =>
				cellComponent(FightDetails, { realm: data.realm, bosskill: info.row.original }),
			enableSorting: false
		}
	];
	const columnsUnknown = columns as any as ColumnDef<unknown>[];
</script>

<svelte:head>
	<title>Latest Bosskills</title>
</svelte:head>
<h1>Latest Bosskills</h1>
<div style="margin-bottom: 1rem;">
	<FilterForm realm={data.realm} data={data.form.data} values={data.form.values} />
</div>
<div>
	<Table
		data={data.latest.data}
		columns={columnsUnknown}
		sorting={[{ id: 'killedAt', desc: true }]}
	>
		<svelte:fragment slot="pagination">
			<Pagination
				path={links.bossKills(data.realm)}
				searchParams={$page.url.searchParams}
				page={page_}
				{pageSize}
				totalItems={data.latest.total}
			/>
		</svelte:fragment>
	</Table>
</div>
