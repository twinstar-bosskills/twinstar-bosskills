<script lang="ts" context="module">
	export type ECharts = typeof import('echarts/core') | typeof import('echarts');
	export type EChartsOptions = echarts.EChartsCoreOption;
	export type EChartsTheme = string | object;

	export type ChartOptions = {
		echarts: ECharts;
		theme?: EChartsTheme;
		width?: number;
		height?: number;
		options: EChartsOptions;
	};

	const DEFAULT_OPTIONS: Partial<ChartOptions> = {
		theme: 'dark',
		height: 300,
		width: 1920
	};

	export function chartable(element: HTMLElement, echartOptions: ChartOptions) {
		const { theme, options, echarts, height } = {
			...DEFAULT_OPTIONS,
			...echartOptions
		};
		const chart = echarts.init(element, theme, { renderer: 'svg', height });
		chart.setOption(options);

		function handleResize() {
			chart?.resize();
		}

		window.addEventListener('resize', handleResize);

		return {
			destroy() {
				chart?.dispose();
				window.removeEventListener('resize', handleResize);
			},
			update(newOptions: ChartOptions) {
				chart?.setOption({
					...echartOptions.options,
					...newOptions.options
				});
			}
		};
	}
	export function ssr(echartOptions: ChartOptions) {
		const { theme, options, echarts, width, height } = {
			...DEFAULT_OPTIONS,
			...echartOptions
		};
		const chart = echarts.init(null, theme, {
			renderer: 'svg',
			ssr: true,
			width,
			height
		});
		chart.setOption(options);
		return chart.renderToSVGString();
	}
</script>

<script lang="ts">
	import { browser } from '$app/environment';

	export let options: echarts.EChartsCoreOption;
	export let { width } = DEFAULT_OPTIONS;
	export let { height } = DEFAULT_OPTIONS;
	export let { theme } = DEFAULT_OPTIONS;
	export let echarts: ECharts;
</script>

{#if browser}
	<div class="chart" use:chartable={{ echarts, theme, options, height, width }} />
{:else}
	<div class="chart">
		{@html ssr({ echarts, theme, options, height, width })}
	</div>
	<style>
		.chart > svg {
			width: 100%;
		}
	</style>
{/if}

<style>
	.chart {
		max-width: 100vw;
		height: 100%;
		width: 100%;
	}
</style>
