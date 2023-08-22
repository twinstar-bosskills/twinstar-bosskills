<script lang="ts">
	import AxisX from '$lib/components/chart/AxisX.html.svelte';
	import AxisY from '$lib/components/chart/AxisY.html.svelte';
	import Bar from '$lib/components/chart/bar/Bar.svelte';
	import SharedTooltip from '$lib/components/chart/multiline/SharedTooltip.percent-range.html.svelte';
	import { formatTzLocalized } from '$lib/date';
	import { scaleBand } from 'd3-scale';
	import { Html, LayerCake, ScaledSvg } from 'layercake';
	import type { PageData } from './$types';

	export let data: PageData;

	type ByData = {
		key: string;
		value: number;
	};

	const byWeekDay: ByData[] = [];
	for (const [key, value] of Object.entries(data.byWeekDay)) {
		byWeekDay.push({ key, value });
	}
	byWeekDay.sort((a, b) => b.value - a.value);
	const yDomainByWeekDay = byWeekDay.map((v) => v.key);

	const byHour: ByData[] = [];
	for (const [key, value] of Object.entries(data.byHour)) {
		byHour.push({ key, value });
	}
	byHour.sort((a, b) => b.value - a.value);
	const yDomainByHour = byHour.map((v) => v.key);
</script>

<svelte:head>
	<title>Twinstar Bosskills</title>
</svelte:head>
<h1>Welcome to Twinstar Bosskills</h1>

{#if data.first && data.last}
	<h2>
		Bosskills between {formatTzLocalized(data.first.time)} and {formatTzLocalized(data.last.time)}
	</h2>
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

<!-- <h2>Highlights</h2>
<h3>Best damager of the week: TODO</h3>
<h3>Best healer of the week: TODO</h3> -->
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
		color: greenyellow;
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
		margin-left: 1rem;
		font-size: 75%;
		color: greenyellow;
	}
</style>
