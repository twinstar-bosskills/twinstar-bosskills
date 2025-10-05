<script lang="ts">
	import TextColorError from '$lib/components/TextColorError.svelte';
	import TextColorSuccess from '$lib/components/TextColorSuccess.svelte';
	import Table, { cellComponent } from '$lib/components/table/Table.svelte';
	import Boss from '$lib/components/table/column/BosskillBoss.column.svelte';
	import { formatTzLocalized } from '$lib/date';
	import type { ColumnDef } from '@tanstack/svelte-table';

	import BossKillsByTimeBarChart from '$lib/components/echart/BossKillsByTimeBarChart.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	const current = data.thisRaidLock;
	const previous = data.lastRaidLock;

	type T = (typeof current.killsByBoss)[0];
	const byBossColumns: ColumnDef<T>[] = [
		{
			id: 'count',
			accessorFn: (row) => row.count,
			header: () => 'Count'
		},
		{
			id: 'boss',
			accessorFn: (row) => row.count,
			header: () => 'Boss',
			cell: (info) => {
				const bk = info.row.original;
				return cellComponent(Boss, {
					realm: data.realm,
					bosskill: {
						entry: bk.bossRemoteId,
						mode: bk.mode,
						creature_name: bk.bossName
					}
				});
			}
		},
		{
			id: 'difficulty',
			accessorFn: (row) => row.difficulty,
			header: () => 'Difficulty'
		}
	];
	const byBossColumnsUnknown = byBossColumns as any as ColumnDef<unknown>[];
</script>

<svelte:head>
	<title>Twinstar Bosskills</title>
</svelte:head>
<h1>Twinstar Bosskills</h1>

<div class="raidlocks">
	{#each [current, previous] as item, i}
		<div class="raidlock">
			{#if i === 0}
				<h2>Current raid lockout bosskills</h2>
			{:else}
				<h2>Previous raid lockout bosskills</h2>
			{/if}
			{#if item.first && item.last}
				<div style="margin-left: 1rem; margin-top: -1rem; font-size: 90%;">
					between {formatTzLocalized(item.first.time)} and {formatTzLocalized(item.last.time)}
				</div>
			{/if}
			<div class="by-boss">
				<div>
					<h3>Most kills - total <TextColorSuccess>{item.kills}</TextColorSuccess></h3>
					<div class="tc">
						<Table
							data={item.killsByBoss}
							columns={byBossColumnsUnknown}
							sorting={[{ id: 'count', desc: true }]}
						/>
					</div>
				</div>
				<div>
					<h3>
						Most wipes - total <TextColorError>{item.wipes}</TextColorError>, wipe chance
						<TextColorError>{item.wipePercentage}%</TextColorError>
					</h3>
					<div class="tc">
						<Table
							data={item.wipesByBoss}
							columns={byBossColumnsUnknown}
							sorting={[{ id: 'count', desc: true }]}
						/>
					</div>
				</div>
			</div>

			<h3>Number of bosskills grouped by day of week</h3>
			{#if item.top}
				{@const top = item.top}
				<div>
					<div>
						{#if top.topDay}
							<div class="top-raid">
								<span style="font-weight: bold;">{top.topDay.key}</span>
								is top raiding day
							</div>
						{/if}
						<BossKillsByTimeBarChart
							xAxisData={top.byWeekDay.map((d) => d.key)}
							series={top.byWeekDay.map((d) => d.value)}
							height={Math.min(data.windowInnerHeight ?? 300, 600)}
						/>
					</div>
				</div>
				<h3>Number of bosskills grouped by hour</h3>
				<div>
					<div>
						{#if top.topHour}
							<div class="top-raid">
								<span style="font-weight: bold;">{top.topHour.key}</span> is top raiding hour
							</div>
						{/if}
						<BossKillsByTimeBarChart
							width={data.windowInnerWidth}
							xAxisData={top.byHour.map((d) => d.key)}
							series={top.byHour.map((d) => d.value)}
						/>
					</div>
				</div>
			{/if}
		</div>
	{/each}
</div>

<style>
	.raidlocks {
		display: flex;
		flex-direction: column;
	}

	.top-raid {
		display: block;
		margin-left: 0.5rem;
		color: var(--color-success);
	}

	.by-boss {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.by-boss .tc {
		max-height: 500px;
		overflow: auto;
	}

	@media (max-width: 900px) {
		.by-boss {
			display: flex;
			flex-wrap: wrap;
		}
	}
	@media (max-width: 450px) {
		.by-boss > div {
			width: 100%;
		}
	}
</style>
