<script lang="ts">
	import { browser } from '$app/environment';

	// TODO: THIS IS OVER 1MB!!!
	// https://www.reddit.com/r/sveltejs/comments/tuvcgg/sveltekit_and_apache_echarts_minimal_bundle/
	// import * as echarts from 'echarts';

	// NOTE: if something breaks, just `import * as echarts from 'echarts';`
	import type { EChartsOption } from 'echarts';
	import { LineChart, ScatterChart } from 'echarts/charts';
	import {
		GridComponent,
		LegendComponent,
		TitleComponent,
		TooltipComponent
	} from 'echarts/components';
	import * as echarts from 'echarts/core';
	import { SVGRenderer } from 'echarts/renderers';
	import { onDestroy, onMount } from 'svelte';

	export let xAxisData: number[] = [];
	export let seriesEncounterDamage: number[] = [];
	export let seriesEncounterHeal: number[] = [];
	export let seriesRaidDamage: number[] = [];
	export let seriesRaidHeal: number[] = [];
	export let seriesDeaths: any[] = [];
	export let seriesRessurects: any[] = [];

	echarts.use([
		TitleComponent,
		ScatterChart,
		TooltipComponent,
		GridComponent,
		LegendComponent,
		LineChart,
		SVGRenderer
	]);

	const option: EChartsOption = {
		backgroundColor: 'transparent',

		// title: {
		// 	text: 'Fight timeline'
		// },
		tooltip: {
			trigger: 'axis'
		},
		legend: {
			data: ['Enemy Healing', 'Enemy Damage', 'Raid Damage', 'Raid Healing', 'Deaths', 'Ressurects']
		},
		animation: false,
		grid: {
			left: '3%',
			right: '3%',
			bottom: '2%',
			containLabel: true
		},
		xAxis: {
			type: 'category',
			boundaryGap: false,
			data: xAxisData
		},
		yAxis: {
			type: 'value',
			axisLabel: {
				formatter: (d) => {
					return d.toLocaleString(undefined, { notation: 'compact' });
				}
			}
		},
		series: [
			{
				name: 'Enemy Healing',
				type: 'line',

				color: 'lightblue',
				data: seriesEncounterHeal
			},
			{
				name: 'Enemy Damage',
				type: 'line',

				color: 'red',
				data: seriesEncounterDamage
			},
			{
				name: 'Raid Damage',
				type: 'line',

				color: 'gold',
				data: seriesRaidDamage
			},
			{
				name: 'Raid Healing',
				type: 'line',

				color: 'green',
				data: seriesRaidHeal
			},
			{
				name: 'Deaths',
				type: 'scatter',
				// symbolSize: 10,

				color: 'pink',
				data: seriesDeaths
			},
			{
				name: 'Ressurects',
				type: 'scatter',

				color: 'white',
				data: seriesRessurects
			}
		]
	};

	let chart: echarts.ECharts | null = null;
	let el: HTMLDivElement | null = null;
	onMount(() => {
		chart = echarts.init(el, 'dark', {
			renderer: 'svg',
			height: 300
		});
		chart.setOption(option);
		window.addEventListener('resize', function () {
			chart?.resize();
		});
	});

	onDestroy(() => {
		chart?.dispose();
	});

	// https://gist.github.com/pissang/4c32ee30e35c91336af72b129a1a4a73?permalink_comment_id=4080038#gistcomment-4080038
	if (!browser) {
		chart = echarts.init(null, 'dark', {
			renderer: 'svg',
			ssr: true,
			width: 1920,
			height: 300
		});
		chart.setOption(option);
	}
</script>

<div class="chart">
	{#if browser}
		<div bind:this={el} style="min-width: 200px;" />
	{:else}
		{@html chart?.renderToSVGString()}
		<style>
			.chart > svg {
				width: 100%;
			}
		</style>
	{/if}
</div>

<style>
	.chart {
		max-width: 100vw;
	}
</style>
