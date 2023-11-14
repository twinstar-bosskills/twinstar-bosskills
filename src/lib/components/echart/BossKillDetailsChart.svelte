<script lang="ts">
	// TODO: THIS IS OVER 1MB!!!
	// https://www.reddit.com/r/sveltejs/comments/tuvcgg/sveltekit_and_apache_echarts_minimal_bundle/
	// import * as echarts from 'echarts';

	// NOTE: if something breaks, just `import * as echarts from 'echarts';`
	import type { Character } from '$lib/model';
	import type { EChartsOption, TooltipComponentFormatterCallbackParams } from 'echarts';
	import { LineChart, ScatterChart } from 'echarts/charts';
	import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
	import * as echarts from 'echarts/core';
	import { LabelLayout } from 'echarts/features';
	import { SVGRenderer } from 'echarts/renderers';
	import type { CallbackDataParams } from 'echarts/types/dist/shared';
	import Chart from './Chart.svelte';

	type TDeathOrRess = { value: number; players: Character[] };
	export let width: number | undefined = undefined;
	export let xAxisData: number[] = [];
	export let seriesEncounterDamage: number[] = [];
	export let seriesEncounterHeal: number[] = [];
	export let seriesRaidDamage: number[] = [];
	export let seriesRaidHeal: number[] = [];
	export let seriesDeaths: TDeathOrRess[] = [];
	export let seriesRessurects: TDeathOrRess[] = [];

	echarts.use([
		ScatterChart,
		TooltipComponent,
		GridComponent,
		LegendComponent,
		LineChart,
		LabelLayout,
		SVGRenderer
	]);

	const renderPlayerTooltipParam = (data: TDeathOrRess) => {
		let l = data.players.map((p) => p.name).join(',');
		// l += ` has died`;
		return l;
	};

	const renderTooltipParam = (item: CallbackDataParams | null) => {
		if (item === null || typeof item.data === 'undefined') {
			return '';
		}

		let value = 'N/A';
		if (item.seriesId === 'ressurects' || item.seriesId === 'deaths') {
			value = renderPlayerTooltipParam(item.data as any as TDeathOrRess);
		} else {
			value = item.data?.toLocaleString() ?? 'N/A';
		}
		return `<li>${item.marker} ${item.seriesName}: ${value}</li>`;
	};

	const options: EChartsOption = {
		backgroundColor: 'transparent',
		tooltip: {
			trigger: 'axis',
			confine: true,
			padding: 1,

			formatter(params: TooltipComponentFormatterCallbackParams) {
				if (Array.isArray(params)) {
					const enemyHealing = params.find((p) => p.seriesId === 'enemyHealing') ?? null;
					const enemyDamage = params.find((p) => p.seriesId === 'enemyDamage') ?? null;
					const raidDamage = params.find((p) => p.seriesId === 'raidDamage') ?? null;
					const raidHealing = params.find((p) => p.seriesId === 'raidHealing') ?? null;
					const deaths = params.find((p) => p.seriesId === 'deaths') ?? null;
					const ressurects = params.find((p) => p.seriesId === 'ressurects') ?? null;

					return `<div style="
						background: rgba(var(--color-bg), 0.9);
						padding: 0.5rem;
						color: var(--color-fg);">
					<ul>
						${renderTooltipParam(enemyHealing)}
						${renderTooltipParam(enemyDamage)}
						${renderTooltipParam(raidHealing)}
						${renderTooltipParam(raidDamage)}
						${renderTooltipParam(deaths)}
						${renderTooltipParam(ressurects)}
					</ul>
					</div>`;
				}

				return 'N/A';
			}
		},
		legend: {
			data: ['Enemy Healing', 'Enemy Damage', 'Raid Damage', 'Raid Healing', 'Deaths', 'Ressurects']
		},
		animation: false,
		grid: {
			containLabel: true,
			left: '1%',
			// right: '4%',
			right: '0%',
			bottom: '2%'
		},
		xAxis: {
			type: 'category',
			boundaryGap: false,
			data: xAxisData
		},
		yAxis: [
			{
				type: 'value',
				axisLabel: {
					formatter: (d) => {
						return d.toLocaleString(undefined, { notation: 'compact' });
					}
				}
			},
			{
				type: 'value',
				name: 'Deaths',
				position: 'right',
				// offset: 40,
				show: false,
				// axisLine: {
				// 	show: true,
				// 	lineStyle: {
				// 		color: 'white'
				// 	}
				// },
				min: 0,
				max: 1,
				minInterval: 1
			},
			{
				type: 'value',
				name: 'Ress',
				position: 'right',
				show: false,
				// axisLine: {
				// 	show: true,
				// 	lineStyle: {
				// 		color: 'pink'
				// 	}
				// },
				min: 0,
				max: 1,
				minInterval: 1
			}
		],
		series: [
			{
				id: 'enemyHealing',
				name: 'Enemy Healing',
				type: 'line',

				color: 'lightblue',
				data: seriesEncounterHeal
			},
			{
				id: 'enemyDamage',
				name: 'Enemy Damage',
				type: 'line',

				color: 'red',
				data: seriesEncounterDamage
			},
			{
				id: 'raidDamage',
				name: 'Raid Damage',
				type: 'line',

				color: 'gold',
				data: seriesRaidDamage
			},
			{
				id: 'raidHealing',
				name: 'Raid Healing',
				type: 'line',

				color: 'green',
				data: seriesRaidHeal
			},
			{
				id: 'deaths',
				name: 'Deaths',
				type: 'scatter',
				yAxisIndex: 1,

				symbol: 'image:///icons/tombstone-white.png',
				symbolOffset: [-1.3, 40],
				symbolSize: 20,
				color: 'white',
				data: seriesDeaths,
				labelLayout: {
					rotate: 60,
					dy: -5,
					dx: 12
				},
				label: {
					show: true,
					color: 'white',
					position: 'insideBottomLeft',
					formatter: (params) => {
						if (params.data) {
							return renderPlayerTooltipParam(params.data as any as TDeathOrRess);
						}

						return '';
					}
				}
			},
			{
				id: 'ressurects',
				name: 'Ressurects',
				type: 'scatter',
				yAxisIndex: 2,

				// symbol: 'image:///icons/tombstone-pink.png',
				symbolOffset: [0, 40],
				// symbolSize: 20,
				color: 'pink',
				data: seriesRessurects,
				labelLayout: {
					rotate: 60,
					dy: -5,
					dx: 5
				},
				label: {
					show: true,
					color: 'pink',
					position: 'insideBottomLeft',
					formatter: (params) => {
						if (params.data) {
							return renderPlayerTooltipParam(params.data as any as TDeathOrRess);
						}

						return '';
					}
				}
			}
		]
	};
</script>

<Chart {echarts} {options} {width} />
