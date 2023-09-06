<script lang="ts" context="module">
	export const cellComponent = (component: unknown, props: Record<string, unknown>) => ({
		component,
		props
	});
</script>

<script lang="ts">
	import arrowDown from '$lib/assets/icons/arrow-down.svg?raw';
	import arrowUp from '$lib/assets/icons/arrow-up.svg?raw';
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
	export let sorting: SortingState = [];

	const SORT_DIRECTION: Record<string, string> = {
		asc: arrowUp,
		desc: arrowDown
	};

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

<table style="--columns: {columns.length}">
	<thead>
		{#each $table.getHeaderGroups() as headerGroup, i}
			<tr>
				{#each headerGroup.headers as header, j}
					<th
						colSpan={header.colSpan}
						class:sticky-top={i === 0}
						class:sticky-left={j === 0}
						style={j === 0 ? '--left: 0;' : undefined}
					>
						{#if !header.isPlaceholder}
							<!-- svelte-ignore a11y-click-events-have-key-events -->
							<!-- svelte-ignore a11y-no-static-element-interactions -->
							<div
								style="display: flex; align-items: center;"
								class:cursor-pointer={header.column.getCanSort()}
								class:select-none={header.column.getCanSort()}
								on:click={header.column.getToggleSortingHandler()}
							>
								<svelte:component
									this={flexRender(header.column.columnDef.header, header.getContext())}
								/>
								<div style="height: 1rem;">
									{@html SORT_DIRECTION[header.column.getIsSorted().toString()] ?? ''}
								</div>
							</div>
						{/if}
					</th>
				{/each}
			</tr>
		{/each}
	</thead>
	<tbody>
		{#each $table.getRowModel().rows as row, i}
			<tr>
				{#each row.getVisibleCells() as cell, j}
					{@const result =
						typeof cell.column.columnDef.cell === 'function'
							? cell.column.columnDef.cell(cell.getContext())
							: cell.column.columnDef.cell}
					<td
						class:sticky-left={j === 0}
						style={[
							j === 0 ? '--left: 0' : undefined,
							i % 2 === 0 ? 'background: rgba(var(--color-bg), 0.75)' : undefined
						]
							.filter(Boolean)
							.join(';')}
					>
						{#if result.component && result.props}
							<svelte:component this={result.component} {...result.props} />
						{:else if typeof result === 'string' || typeof result === 'number'}
							{result}
						{:else}
							<!-- flexRender is REALLY slow -->
							<svelte:component this={flexRender(cell.column.columnDef.cell, cell.getContext())} />
						{/if}
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
	{#if $$slots.pagination}
		<tfoot>
			<tr>
				<td class="pagination">
					<slot name="pagination" />
				</td>
			</tr>
		</tfoot>
	{/if}
</table>

<style>
	.cursor-pointer {
		cursor: pointer;
	}
	table {
		display: grid;
		grid-template-columns: repeat(var(--columns), max-content);
		/* grid-template-columns: repeat(var(--columns), minmax(max-content, 1fr)); */
	}
	thead,
	tbody,
	tfoot,
	tr {
		display: contents;
	}
	tr td {
		display: flex;
		align-items: center;
	}
	.pagination {
		grid-column-start: 1;
		grid-column-end: calc(var(--columns) + 1);
	}
	.sticky-left {
		position: sticky;
		background: rgba(var(--color-bg), 0.8);
		left: var(--left, 0);
		z-index: 1;
		border-left: 1px solid rgba(var(--color-primary), 1);
		border-right: 1px solid rgba(var(--color-primary), 1);
		border-top: none;
		border-bottom: none;
	}
	tr:last-of-type .sticky-left {
		border-bottom: 1px solid rgba(var(--color-primary), 1);
	}
	.sticky-top {
		position: sticky;
		background: rgba(var(--color-bg), 0.8);
		top: 0;
		z-index: 2;
	}
	.sticky-left.sticky-top {
		z-index: 3;
		border: 1px solid rgba(var(--color-primary), 1);
	}
	@media (max-width: 320px) {
		.sticky-top,
		.sticky-left {
			position: static;
			background: none;
			top: unset;
			left: unset;
			z-index: unset;
		}
	}
</style>
