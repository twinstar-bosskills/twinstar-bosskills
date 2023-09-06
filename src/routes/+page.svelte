<script lang="ts">
	import TextColorError from '$lib/components/TextColorError.svelte';
	import TextColorSuccess from '$lib/components/TextColorSuccess.svelte';
	import Table, { cellComponent } from '$lib/components/table/Table.svelte';
	import Boss from '$lib/components/table/column/Boss.column.svelte';
	import { formatTzLocalized } from '$lib/date';
	import type { ColumnDef } from '@tanstack/svelte-table';

	import BossKillsByTimeBarChart from '$lib/components/echart/BossKillsByTimeBarChart.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	const current = data.thisRaidLock;
	const previous = data.lastRaidLock;
	type ByData = {
		key: string;
		value: number;
	};

	const byWeekDay: ByData[] = [];
	for (const [key, value] of Object.entries(current.byWeekDay)) {
		byWeekDay.push({ key, value });
	}
	byWeekDay.sort((a, b) => b.value - a.value);
	const topDay = byWeekDay[0] ?? 0;

	const byHour: ByData[] = [];
	for (const [key, value] of Object.entries(current.byHour)) {
		byHour.push({ key, value });
	}
	byHour.sort((a, b) => b.value - a.value);
	const topHour = byHour[0] ?? null;

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
					bosskill: {
						entry: bk.bossId,
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
<h1>Welcome to Twinstar Bosskills</h1>

{#if current.first && current.last}
	<h2>Current raid lockout bosskills</h2>
	<div style="margin-left: 1rem; margin-top: -1rem; font-size: 80%;">
		between {formatTzLocalized(current.first.time)} and {formatTzLocalized(current.last.time)}
	</div>
	<div class="by-boss">
		<div>
			<h3>Most kills - total <TextColorSuccess>{current.kills}</TextColorSuccess></h3>
			<h4 style="margin-left: 0.5rem; margin-top: -1rem;">
				Last raid lockout - total <TextColorSuccess>{previous.kills}</TextColorSuccess>
			</h4>
			<div class="tc">
				<Table
					data={current.killsByBoss}
					columns={byBossColumnsUnknown}
					sorting={[{ id: 'count', desc: true }]}
				/>
			</div>
		</div>
		<div>
			<h3>
				Most wipes - total <TextColorError>{current.wipes}</TextColorError>, wipe chance
				<TextColorError>{current.wipePercentage}%</TextColorError>
			</h3>
			<h4 style="margin-left: 0.5rem; margin-top: -1rem;">
				Last raid lockout - total <TextColorError>{previous.wipes}</TextColorError>, wipe chance
				<TextColorError>{previous.wipePercentage}%</TextColorError>
			</h4>
			<div class="tc">
				<Table
					data={current.wipesByBoss}
					columns={byBossColumnsUnknown}
					sorting={[{ id: 'count', desc: true }]}
				/>
			</div>
		</div>
	</div>

	<h3>Number of bosskills grouped by day of week</h3>

	<div>
		<div>
			{#if topDay}
				<div class="top-raid">
					<span style="font-weight: bold;">{topDay.key}</span>
					is top raiding day
				</div>
			{/if}
			<BossKillsByTimeBarChart
				xAxisData={byWeekDay.map((d) => d.key)}
				series={byWeekDay.map((d) => d.value)}
				height={Math.min(data.windowInnerHeight ?? 300, 600)}
			/>
		</div>
	</div>
	<h3>Number of bosskills grouped by hour</h3>
	<div>
		<div>
			{#if topHour}
				<div class="top-raid">
					<span style="font-weight: bold;">{topHour.key}</span> is top raiding hour
				</div>
			{/if}
			<BossKillsByTimeBarChart
				width={data.windowInnerWidth}
				xAxisData={byHour.map((d) => d.key)}
				series={byHour.map((d) => d.value)}
			/>
		</div>
	</div>
{/if}
<h2>Info</h2>
<h3>DPS and HPS</h3>
<p>DPS and HPS numbers might be slightly different from the ones you can see on Twinhead.</p>
<p>
	We are dividing the value by <span class="strike">usefullTime</span> bosskill length when calculating
	the average.
</p>

<style>
	.strike {
		text-decoration: line-through;
	}

	.top-raid {
		display: block;
		margin-left: 0.5rem;
		color: var(--color-success);
	}

	.by-boss {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
	}
	.by-boss .tc {
		max-height: 500px;
		overflow: auto;
	}
</style>
