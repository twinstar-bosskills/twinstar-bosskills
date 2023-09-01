<script lang="ts">
	import { BarChart, type BarSeriesOption } from 'echarts/charts';
	import { GridComponent, TooltipComponent, type GridComponentOption } from 'echarts/components';
	import * as echarts from 'echarts/core';
	import { SVGRenderer } from 'echarts/renderers';
	import Chart from './Chart.svelte';

	type EChartsOption = echarts.ComposeOption<GridComponentOption | BarSeriesOption>;

	echarts.use([GridComponent, TooltipComponent, BarChart, SVGRenderer]);

	export let xAxisData: string[] = [];
	export let series: number[] = [];
	const options: EChartsOption = {
		backgroundColor: 'transparent',
		tooltip: {
			trigger: 'axis'
		},
		animation: false,
		grid: {
			left: '3%',
			right: '3%',
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
				name: 'Number of bosskills',
				type: 'bar',

				color: 'var(--color-primary)',
				data: series
			}
		]
	};
</script>

<Chart {echarts} {options} />
