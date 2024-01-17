<script lang="ts">
	import { formatTzLocalized } from '$lib/date';
	import type { CharacterPerformanceLine } from '$lib/server/db/character';
	import type { LineSeriesOption, TooltipComponentOption } from 'echarts';
	import { LineChart } from 'echarts/charts';
	import { GridComponent, TooltipComponent, type GridComponentOption } from 'echarts/components';
	import * as echarts from 'echarts/core';
	import { SVGRenderer } from 'echarts/renderers';
	import Chart from './Chart.svelte';

	type EChartsOption = echarts.ComposeOption<
		GridComponentOption | TooltipComponentOption | LineSeriesOption
	>;

	echarts.use([GridComponent, TooltipComponent, LineChart, SVGRenderer]);

	export let width: number | undefined = undefined;
	export let height: number | undefined = undefined;
	export let data: CharacterPerformanceLine = [];

	const xAxisData = [];
	const dpsData = [];
	const hpsData = [];
	for (const item of data) {
		xAxisData.push(formatTzLocalized(item.time));
		dpsData.push({ value: item.dps });
		hpsData.push({ value: item.hps });
	}

	const options: EChartsOption = {
		backgroundColor: 'transparent',
		tooltip: {
			trigger: 'axis',
			valueFormatter: (v) => v.toLocaleString()
		},
		animation: false,
		grid: {
			containLabel: true,
			left: '1%',
			right: '1%',
			bottom: '10%',
			top: '5%'
		},
		xAxis: {
			type: 'category',
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
				name: 'DPS over time',
				type: 'line',
				color: 'gold',
				data: dpsData
			},
			{
				name: 'HPS over time',
				type: 'line',
				color: 'green',
				data: hpsData
			}
		]
	};
</script>

<Chart {echarts} {options} {width} {height} />
