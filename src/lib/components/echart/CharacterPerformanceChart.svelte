<script lang="ts">
	import { formatTzLocalized } from '$lib/date';
	import type { CharacterPerformanceLine } from '$lib/server/db/character';
	import type {
		LegendComponentOption,
		LineSeriesOption,
		TooltipComponentFormatterCallbackParams,
		TooltipComponentOption
	} from 'echarts';
	import { LineChart } from 'echarts/charts';
	import {
		GridComponent,
		LegendComponent,
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

	echarts.use([GridComponent, TooltipComponent, LegendComponent, LineChart, SVGRenderer]);

	export let width: number | undefined = undefined;
	export let height: number | undefined = undefined;
	export let data: CharacterPerformanceLine = [];

	type OptionData = {
		value: number;
		talentSpec: number;
	};
	const xAxisData = [];
	const dpsData: OptionData[] = [];
	const hpsData: OptionData[] = [];
	for (const item of data) {
		xAxisData.push(formatTzLocalized(item.time));
		dpsData.push({ value: item.dps, talentSpec: item.talentSpec });
		hpsData.push({ value: item.hps, talentSpec: item.talentSpec });
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
				formatter: (d) => {
					return d.toLocaleString(undefined, { notation: 'compact' });
				}
			}
		},
		series: [
			{
				name: 'DPS',
				type: 'line',
				color: 'gold',
				data: dpsData
			},
			{
				name: 'HPS',
				type: 'line',
				color: 'green',
				data: hpsData
			}
		]
	};
</script>

<Chart {echarts} {options} {width} {height} />
