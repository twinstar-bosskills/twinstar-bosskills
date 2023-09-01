<script lang="ts">
	import type { EChartsOption } from 'echarts';
	import { BoxplotChart } from 'echarts/charts';
	import {
		DatasetComponent,
		GridComponent,
		TitleComponent,
		TooltipComponent,
		TransformComponent
	} from 'echarts/components';
	import * as echarts from 'echarts/core';
	import { UniversalTransition } from 'echarts/features';
	import { SVGRenderer } from 'echarts/renderers';
	// @ts-ignore
	import * as ecSimpleTransform from 'echarts-simple-transform';
	import type { Boss } from '../../model';

	import type { BossAggregatedStats } from '$lib/server/api';
	import Chart from './Chart.svelte';

	export let id: Boss['entry'];
	export let difficulty: string | number;
	export let raw: BossAggregatedStats;
	export let field = 'dps';

	echarts.use([
		DatasetComponent,
		TitleComponent,
		TooltipComponent,
		GridComponent,

		TransformComponent,
		BoxplotChart,

		SVGRenderer,
		UniversalTransition
	]);
	echarts.registerTransform(ecSimpleTransform.aggregate);

	const options: EChartsOption = {
		backgroundColor: 'transparent',
		dataset: [
			{
				id: 'raw',
				source: raw as any[]
			},
			{
				id: 'value_aggregate',
				fromDatasetId: 'raw',
				transform: [
					{
						type: 'ecSimpleTransform:aggregate',
						config: {
							resultDimensions: [
								{ name: 'min', from: 'value', method: 'min' },
								{ name: 'Q1', from: 'value', method: 'Q1' },
								{ name: 'median', from: 'value', method: 'median' },
								{ name: 'Q3', from: 'value', method: 'Q3' },
								{ name: 'max', from: 'value', method: 'max' },
								// { name: 'Spec', from: 'spec' }
								{ name: 'Talent specialization', from: 'label' }
							],
							groupBy: 'spec'
						}
					},
					{
						type: 'sort',
						config: {
							dimension: 'Q3',
							order: 'asc'
						}
					}
				]
			}
		],
		title: {
			text: 'DPS Distribution'
		},
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
					return v;
				}
			}
		},
		grid: {
			bottom: 100
		},
		// legend: {
		// 	selected: { detail: false }
		// },
		series: [
			{
				name: `Type ${field}`,
				type: 'boxplot',
				datasetId: 'value_aggregate',
				// itemStyle: {
				// 	color: 'var(--color-primary)'
				// },
				encode: {
					x: ['min', 'Q1', 'median', 'Q3', 'max'],
					y: 'spec',
					// itemName: ['Spec'],
					tooltip: ['min', 'Q1', 'median', 'Q3', 'max']
				}
			}
		]
	};
</script>

<div style="min-height: 1000px;">
	{#if raw.length > 0}
		<Chart {echarts} {options} height={1000} />
	{/if}
</div>
