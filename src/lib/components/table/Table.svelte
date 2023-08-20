<script lang="ts">
	import {
		createSvelteTable,
		flexRender as flexRenderOrig,
		getCoreRowModel,
		getSortedRowModel,
		type ColumnDef,
		type SortingState,
		type TableOptions
	} from '@tanstack/svelte-table';
	import type { ComponentType, SvelteComponent } from 'svelte';
	import { writable } from 'svelte/store';

	const flexRender = <P extends Record<string, any>, C = any>(
		component: C,
		props: P
	): ComponentType<SvelteComponent> =>
		flexRenderOrig(component, props) as ComponentType<SvelteComponent>;

	type T = unknown;
	export let data: T[] = [];
	export let columns: ColumnDef<T>[] = [];

	const SORT_DIRECTION: Record<string, string> = {
		asc: ' 🔼',
		desc: ' 🔽'
	};
	let sorting: SortingState = [];

	const setSorting: TableOptions<T>['onSortingChange'] = (updater) => {
		if (updater instanceof Function) {
			sorting = updater(sorting);
		} else {
			sorting = updater;
		}
		options.update((old) => ({
			...old,
			state: {
				...old.state,
				sorting
			}
		}));
	};

	const options = writable<TableOptions<T>>({
		data,
		columns,
		state: {
			sorting
		},
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		debugTable: false
	});

	const table = createSvelteTable(options);
</script>

<table>
	<thead>
		{#each $table.getHeaderGroups() as headerGroup}
			<tr>
				{#each headerGroup.headers as header}
					<th colSpan={header.colSpan}>
						{#if !header.isPlaceholder}
							<!-- svelte-ignore a11y-click-events-have-key-events -->
							<!-- svelte-ignore a11y-no-static-element-interactions -->
							<div
								class:cursor-pointer={header.column.getCanSort()}
								class:select-none={header.column.getCanSort()}
								on:click={header.column.getToggleSortingHandler()}
							>
								<svelte:component
									this={flexRender(header.column.columnDef.header, header.getContext())}
								/>
								{SORT_DIRECTION[header.column.getIsSorted().toString()] ?? ''}
							</div>
						{/if}
					</th>
				{/each}
			</tr>
		{/each}
	</thead>
	<tbody>
		{#each $table.getRowModel().rows as row}
			<tr>
				{#each row.getVisibleCells() as cell}
					<td>
						<svelte:component this={flexRender(cell.column.columnDef.cell, cell.getContext())} />
					</td>
				{/each}
			</tr>
		{/each}
	</tbody>

	<!-- <tfoot>
		{#each $table.getFooterGroups() as footerGroup}
			<tr>
				{#each footerGroup.headers as header}
					<th colSpan={header.colSpan}>
						{#if !header.isPlaceholder}
							<svelte:component
								this={flexRender(header.column.columnDef.footer, header.getContext())}
							/>
						{/if}
					</th>
				{/each}
			</tr>
		{/each}
	</tfoot> -->
</table>

<style>
	.cursor-pointer {
		cursor: pointer;
	}
</style>
