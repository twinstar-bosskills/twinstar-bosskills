<script lang="ts">
	import { formatTzLocalized } from '$lib/date';
	import type { CharacterPerformanceLine } from '$lib/server/db/character';
	import type {
		LegendComponentOption,
		LineSeriesOption,
		TooltipComponentFormatterCallbackParams,
		TooltipComponentOption,
		DefaultLabelFormatterCallbackParams
	} from 'echarts';
	import { LineChart } from 'echarts/charts';
	import {
		GridComponent,
		LegendComponent,
		MarkLineComponent,
		TooltipComponent,
		type GridComponentOption
	} from 'echarts/components';
	import * as echarts from 'echarts/core';
	import { SVGRenderer } from 'echarts/renderers';
	import SpecIcon from '../icon/SpecIcon.svelte';
	import { renderComponentToHtml } from '../render';
	import Chart from './Chart.svelte';

	type EChartsOption = echarts.ComposeOption<
		GridComponentOption | TooltipComponentOption | LineSeriesOption | LegendComponentOption
	>;

	echarts.use([
		GridComponent,
		LegendComponent,
		MarkLineComponent,
		TooltipComponent,
		LineChart,
		SVGRenderer
	]);

	export let width: number | undefined = undefined;
	export let height: number | undefined = undefined;
	export let median: { hps?: number; dps?: number } | undefined = undefined;
	export let data: CharacterPerformanceLine = [];

	type OptionData = {
		value: number;
		talentSpec: number;
	};
	let yAxisMax = 0;
	const xAxisData = [];
	const dpsData: OptionData[] = [];
	const hpsData: OptionData[] = [];
	for (const item of data) {
		xAxisData.push(formatTzLocalized(item.time));
		dpsData.push({ value: item.dps, talentSpec: item.talentSpec });
		hpsData.push({ value: item.hps, talentSpec: item.talentSpec });
		yAxisMax = Math.max(yAxisMax, item.dps, item.hps);
	}

	const formatter = (d: number) => {
		return d.toLocaleString(undefined, { notation: 'compact' });
	};

	let dpsMarkLine: LineSeriesOption['markLine'] = undefined;
	let hpsMarkLine: LineSeriesOption['markLine'] = undefined;
	if (typeof median?.dps === 'number') {
		dpsMarkLine = {
			symbol: 'none',
			label: {
				position: 'insideStartTop',
				color: 'gold',
				formatter: (params: DefaultLabelFormatterCallbackParams) => {
					// @ts-expect-error
					return `Median DPS: ${formatter(params.data.value)}`;
				}
			},
			data: [
				{
					yAxis: median.dps,
					lineStyle: {
						color: 'gold'
					},
					symbolSize: 0
				}
			]
		};
		yAxisMax = Math.max(yAxisMax, median.dps);
	}

	if (typeof median?.hps === 'number') {
		hpsMarkLine = {
			symbol: 'none',
			label: {
				position: 'insideStartTop',
				color: 'green',
				formatter: (params: DefaultLabelFormatterCallbackParams) => {
					// @ts-expect-error
					return `Median HPS: ${formatter(params.data.value)}`;
				}
			},
			data: [
				{
					yAxis: median.hps,
					lineStyle: {
						color: 'green'
					}
				}
			]
		};
		yAxisMax = Math.max(yAxisMax, median.hps);
	}

	const options: EChartsOption = {
		backgroundColor: 'transparent',
		tooltip: {
			trigger: 'axis',
			valueFormatter: (v) => v.toLocaleString(),
			formatter: (params: TooltipComponentFormatterCallbackParams) => {
				let html = '';
				if (Array.isArray(params) && params.length > 0) {
					html +=
						'<div style="display: grid; grid-template-columns: max-content max-content max-content; gap: 0.25rem">';
					for (const value of params) {
						const data = value.data as OptionData;
						const specHTML = renderComponentToHtml(SpecIcon, {
							realm: 'Helios',
							talentSpec: data.talentSpec
						});
						html += `<div style="display: flex; align-items: center;">${specHTML}</div>`;
						html += `<div style="display: flex; align-items: center;"">${value.marker} ${value.seriesName}:</div>`;
						html += `<div style="display: flex; align-items: center; font-weight: bold;">${data.value.toLocaleString()}</div> `;
					}
					html += '</div>';
				}
				return html;
			}
		},
		legend: {
			show: true
		},
		animation: false,
		grid: {
			containLabel: true,
			left: '1%',
			right: '1%',
			bottom: '10%',
			top: '10%'
		},
		xAxis: {
			type: 'category',
			data: xAxisData
		},
		yAxis: {
			type: 'value',
			axisLabel: {
				formatter: formatter
			},
			min: 0,
			max: yAxisMax
		},
		series: [
			{
				name: 'DPS',
				type: 'line',
				color: 'gold',
				data: dpsData,
				markLine: dpsMarkLine
			},
			{
				name: 'HPS',
				type: 'line',
				color: 'green',
				data: hpsData,
				markLine: hpsMarkLine
			}
		]
	};
</script>

<Chart {echarts} {options} {width} {height} />
