<script lang="ts">
	import type { EChartsOption } from 'echarts';
	import { BoxplotChart } from 'echarts/charts';
	import { GridComponent, TooltipComponent } from 'echarts/components';
	import * as echarts from 'echarts/core';
	import { SVGRenderer } from 'echarts/renderers';
	import { talentSpecToClass, talentSpecToString } from '@twinstar-bosskills/core/dist/wow';

	import { REALM_HELIOS, realmToExpansion } from '@twinstar-bosskills/core/dist/realm';
	import { getTalentSpecIconUrl } from '@twinstar-bosskills/api/dist/talent';
	import Chart from './Chart.svelte';
	import type { AggregatedBySpecStats } from '@twinstar-bosskills/chart';

	export let realm: string = REALM_HELIOS;
	export let width: number | undefined = undefined;
	export let aggregated: AggregatedBySpecStats;
	export let field = 'dps';

	const expansion = realmToExpansion(realm);
	echarts.use([TooltipComponent, GridComponent, BoxplotChart, SVGRenderer]);

	// TextCommonOption
	const rich: Record<number | string, any> = {};
	for (const [i, spec] of Object.entries(aggregated.indexToSpecId)) {
		rich[i] = {
			width: 24,
			height: 24,
			align: 'right',
			backgroundColor: {
				image: getTalentSpecIconUrl(realm, spec)
			}
		};
	}

	let options: EChartsOption = {
		backgroundColor: 'transparent',
		animation: false,
		tooltip: {
			trigger: 'axis',
			confine: true,
			padding: 1,
			formatter(params: any) {
				const p = params[0] ?? null;
				if (p === null) {
					return 'Unknown';
				}
				let [index, min, q1, med, q3, max] = p.data.value;
				min = typeof min === 'number' ? min.toLocaleString() : min;
				q1 = typeof q1 === 'number' ? q1.toLocaleString() : q1;
				med = typeof med === 'number' ? med.toLocaleString() : med;
				q3 = typeof q3 === 'number' ? q3.toLocaleString() : q3;
				max = typeof max === 'number' ? max.toLocaleString() : max;

				const spec = aggregated.indexToSpecId[index];
				if (spec) {
					const cls = talentSpecToClass(expansion, spec);
					const specString = talentSpecToString(expansion, spec);
					return `
					<div style="
						background: rgba(var(--color-bg), 0.9);
						padding: 0.5rem;
						color: var(--color-fg);
					">
						<div>${field.toUpperCase()}</div>
						<div style="
						display: flex;
						align-items: center;
						font-weight: bold;
						border-radius: 3px;
						padding: 3px 6px;
						padding-left: 0;
						">
							<div style="
							width: 1rem;
							height: 1rem;
							background: var(--color-class-${cls});
							border-radius: 50%;
							border: 1px solid rgba(var(--color-bg), 0.5);
							margin-right: 6px;
							"></div>
							${specString}
						</div>
						<ul>
							<li>${p.marker} ${field.toUpperCase()}</li>
							<li>Min: ${min}</li>
							<li>Q1: ${q1}</li>
							<li style="font-weight: bold;">Median: ${med}</li>
							<li>Q3: ${q3}</li>
							<li>Max: ${max}</li>
						</ul>
					</div>
					`;
				}
				return 'N/A';
			}
		},
		xAxis: {
			id: field,
			name: field.toUpperCase(),
			nameLocation: 'middle',
			nameGap: 30,
			scale: true
		},
		yAxis: {
			id: 'spec',
			type: 'category',
			// data: aggregated.prepared.axisData,
			axisLabel: {
				rich,
				color: (i) => {
					const spec = aggregated.indexToSpecId?.[Number(i)] ?? null;
					let cls = null;
					if (spec) {
						cls = talentSpecToClass(expansion, spec);
						return `var(--color-class-${cls})`;
					}
					return `var(--color-fg)`;
				},
				fontSize: '0.75rem',
				formatter: (v) => {
					const spec = aggregated.indexToSpecId?.[Number(v)] ?? null;
					if (spec) {
						return talentSpecToString(expansion, spec) + ' {' + v + '|}';
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
				id: field,
				type: 'boxplot',
				data: aggregated.prepared.boxData.map((v, i) => {
					return {
						value: v,
						itemStyle: {
							borderColor: `rgba(var(--color-primary), 1)`,
							color: `rgba(var(--color-primary), 0.25)`
							// color: `transparent`
						}
					};
				})
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
