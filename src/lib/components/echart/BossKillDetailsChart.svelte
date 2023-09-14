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

	const deathOrRessToLabel = (data: TDeathOrRess) => {
		let l = data.players.map((p) => p.name).join(',');
		// l += ` has died`;
		return l;
	};

	const options: EChartsOption = {
		backgroundColor: 'transparent',
		tooltip: {
			trigger: 'axis',
			confine: true,
			padding: 1,

			formatter(params: TooltipComponentFormatterCallbackParams) {
				if (Array.isArray(params)) {
					const enemyHealing = params[0] ?? null;
					const enemyDamage = params[1] ?? null;
					const raidDamage = params[2] ?? null;
					const raidHealing = params[3] ?? null;
					const deaths = params[4] ?? null;
					const ressurects = params[5] ?? null;

					if (
						enemyHealing === null ||
						enemyDamage === null ||
						raidDamage === null ||
						raidHealing === null
					) {
						return 'N/A';
					}

					// console.log({ enemyHealing, enemyDamage, raidDamage, raidHealing, deaths, ressurects });
					let deathsHTML = '';
					if (deaths) {
						const data = deaths.data as any as TDeathOrRess;
						if (data) {
							deathsHTML += `<li>${deaths.marker} Died: `;
							deathsHTML += deathOrRessToLabel(data);
							deathsHTML += `</li>`;
						}
					}

					let ressHTML = '';
					if (ressurects) {
						const data = ressurects.data as any as TDeathOrRess;
						if (data) {
							ressHTML += `<li>${ressurects.marker} Ressurected: `;
							ressHTML += deathOrRessToLabel(data);
							ressHTML += `</li>`;
						}
					}
					return `<div style="
						background: rgba(var(--color-bg), 0.9);
						padding: 0.5rem;
						color: var(--color-fg);">
					<ul>
						<li>${enemyHealing.marker} Enemy healing: ${enemyHealing.data?.toLocaleString() ?? 'N/A'}</li>
						<li>${enemyDamage.marker} Enemy damage: ${enemyDamage.data?.toLocaleString() ?? 'N/A'}</li>
						<li>${raidHealing.marker} Raid healing: ${raidHealing.data?.toLocaleString() ?? 'N/A'}</li>
						<li>${raidDamage.marker} Raid damage: ${raidDamage.data?.toLocaleString() ?? 'N/A'}</li>
						${deathsHTML}
						${ressHTML}
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
							return deathOrRessToLabel(params.data as any as TDeathOrRess);
						}

						return '';
					}
				}
			},
			{
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
							return deathOrRessToLabel(params.data as any as TDeathOrRess);
						}

						return '';
					}
				}
			}
		]
	};
</script>

<Chart {echarts} {options} {width} />
