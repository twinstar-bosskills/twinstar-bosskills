<script lang="ts">
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
	import Chart from './Chart.svelte';

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

	const options: EChartsOption = {
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
			left: '1%',
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
</script>

<Chart {echarts} {options} />
