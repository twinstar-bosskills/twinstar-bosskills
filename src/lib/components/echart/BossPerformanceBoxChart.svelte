<script lang="ts">
	import type { EChartsOption } from 'echarts';
	import { BoxplotChart } from 'echarts/charts';
	import { GridComponent, TooltipComponent } from 'echarts/components';
	import * as echarts from 'echarts/core';
	import { SVGRenderer } from 'echarts/renderers';
	import { talentSpecToString } from '../../model';

	import type { BossAggregatedStats } from '$lib/server/api';
	import Chart from './Chart.svelte';

	export let width: number | undefined = undefined;
	export let aggregated: BossAggregatedStats;
	export let field = 'dps';

	echarts.use([TooltipComponent, GridComponent, BoxplotChart, SVGRenderer]);

	const options: EChartsOption = {
		backgroundColor: 'transparent',
		animation: false,
		tooltip: {
			trigger: 'axis',
			confine: true
		},
		xAxis: {
			name: 'dps',
			nameLocation: 'middle',
			nameGap: 30,
			scale: true
		},
		yAxis: {
			id: 'spec',
			type: 'category',
			axisLabel: {
				formatter: (v) => {
					const spec = aggregated.indexToSpecId?.[Number(v)] ?? null;
					if (spec) {
						return talentSpecToString(spec);
					}
					return v;
				}
			}
		},
		grid: {
			containLabel: true,
			top: '1%',
			left: '1%,'
		},
		series: [
			{
				name: `Type ${field}`,
				type: 'boxplot',
				data: aggregated.prepared.boxData
				// this works, be we need class colors
				// colorBy: 'data'
			}
		]
	};
</script>

<!-- <div style="min-height: 1000px;"> -->
<div style="min-height: 600px;">
	{#if aggregated.prepared.boxData.length > 0}
		<Chart {echarts} {options} {width} height={1000} />
	{/if}
</div>
