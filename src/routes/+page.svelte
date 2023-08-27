<script lang="ts">
	import TextColorError from '$lib/components/TextColorError.svelte';
	import TextColorSuccess from '$lib/components/TextColorSuccess.svelte';
	import AxisX from '$lib/components/chart/AxisX.html.svelte';
	import AxisY from '$lib/components/chart/AxisY.html.svelte';
	import Bar from '$lib/components/chart/bar/Bar.svelte';
	import SharedTooltip from '$lib/components/chart/multiline/SharedTooltip.percent-range.html.svelte';
	import Table from '$lib/components/table/Table.svelte';
	import Boss from '$lib/components/table/column/Boss.column.svelte';
	import { formatTzLocalized } from '$lib/date';
	import { flexRender, type ColumnDef } from '@tanstack/svelte-table';
	import { scaleBand } from 'd3-scale';
	import { Html, LayerCake, ScaledSvg } from 'layercake';
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
	const yDomainByWeekDay = byWeekDay.map((v) => v.key);

	const byHour: ByData[] = [];
	for (const [key, value] of Object.entries(current.byHour)) {
		byHour.push({ key, value });
	}
	byHour.sort((a, b) => b.value - a.value);
	const yDomainByHour = byHour.map((v) => v.key);

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
				return flexRender(Boss, {
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

	<div class="grid">
		<div class="chart-container">
			<LayerCake
				ssr={true}
				percentRange={true}
				padding={{ top: 0, right: 0, bottom: 32, left: 65 }}
				x="value"
				y="key"
				yScale={scaleBand().paddingInner(0.05).round(true)}
				yDomain={yDomainByWeekDay}
				xDomain={[0, null]}
				data={byWeekDay}
			>
				<Html>
					<AxisX gridlines={true} baseline={true} snapTicks={true} />
					<AxisY gridlines={false} />
				</Html>
				<ScaledSvg>
					<Bar />
				</ScaledSvg>
				<Html>
					<SharedTooltip offset={0} dataset={byWeekDay} />
				</Html>
			</LayerCake>
		</div>
		<ul>
			{#each byWeekDay as { key, value }, i}
				<li class:top={i === 0}>
					{key}: {value}
					{#if i === 0}
						<div class="top-raid">(top raiding day)</div>
					{/if}
				</li>
			{/each}
		</ul>
	</div>
	<h3>Number of bosskills grouped by hour</h3>
	<div class="grid">
		<div class="chart-container" style="height: 420px;">
			<LayerCake
				ssr={true}
				percentRange={true}
				padding={{ top: 0, right: 0, bottom: 32, left: 65 }}
				x="value"
				y="key"
				yScale={scaleBand().paddingInner(0.05).round(true)}
				yDomain={yDomainByHour}
				xDomain={[0, null]}
				data={byHour}
			>
				<Html>
					<AxisX gridlines={true} baseline={true} snapTicks={true} />
					<AxisY gridlines={false} />
				</Html>
				<ScaledSvg>
					<Bar />
				</ScaledSvg>
				<Html>
					<SharedTooltip offset={0} dataset={byHour} />
				</Html>
			</LayerCake>
		</div>
		<ul>
			{#each byHour as { key, value }, i}
				<li class:top={i === 0}>
					{key}: {value}
					{#if i === 0}
						<div class="top-raid">(top raiding hour)</div>
					{/if}
				</li>
			{/each}
		</ul>
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
	/*
	  The wrapper div needs to have an explicit width and height in CSS.
	  It can also be a flexbox child or CSS grid element.
	  The point being it needs dimensions since the <LayerCake> element will
	  expand to fill it.
	*/
	.chart-container {
		width: 100%;
		height: 250px;
	}
	.top {
		font-weight: bold;
		color: var(--color-success);
	}
	.strike {
		text-decoration: line-through;
	}
	.grid {
		display: grid;
		grid-template-columns: 1fr max-content;
		column-gap: 1rem;
	}
	ul .top-raid {
		display: block;
		margin-left: 0.5rem;
		font-size: 75%;
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
