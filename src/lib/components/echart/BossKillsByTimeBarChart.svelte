<script lang="ts">
	import { browser } from '$app/environment';
	import { BarChart, type BarSeriesOption } from 'echarts/charts';
	import { GridComponent, TooltipComponent, type GridComponentOption } from 'echarts/components';
	import * as echarts from 'echarts/core';
	import { SVGRenderer } from 'echarts/renderers';
	import { onDestroy, onMount } from 'svelte';

	type EChartsOption = echarts.ComposeOption<GridComponentOption | BarSeriesOption>;

	echarts.use([GridComponent, TooltipComponent, BarChart, SVGRenderer]);

	export let xAxisData: string[] = [];
	export let series: number[] = [];
	const option: EChartsOption = {
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
		<div bind:this={el} />
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
