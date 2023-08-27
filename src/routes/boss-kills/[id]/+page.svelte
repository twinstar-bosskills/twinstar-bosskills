<script lang="ts">
	import { quality } from '$lib/css-vars';
	import { formatLocalized, formatSecondsInterval } from '$lib/date';
	import { isRaidDifficultyWithLoot, type Item } from '$lib/model';
	import { formatAvgItemLvl, formatNumber } from '$lib/number';

	import type { PageData } from './$types';

	export let data: PageData;

	const title = `Boss Kill Details - ${data.bosskill.id}`;
	const fightLength = data.bosskill.length;

	let showTooltipById: Record<string, boolean> = {};
	function tooltipKey(item: Item, i: number) {
		return `${item.id}-${i}`;
	}
	function showTooltip(key: string) {
		showTooltipById[key] = true;
	}
	function hideTooltip(key: string) {
		showTooltipById[key] = false;
	}

	// Chart

	import { format, precisionFixed } from 'd3-format';
	import { scaleOrdinal } from 'd3-scale';
	import { Html, LayerCake, ScaledSvg, flatten } from 'layercake';

	import Link from '$lib/components/Link.svelte';
	import LinkExternal from '$lib/components/LinkExternal.svelte';
	import AxisX from '$lib/components/chart/AxisX.html.svelte';
	import AxisY from '$lib/components/chart/AxisY.html.svelte';
	import GroupLabels from '$lib/components/chart/multiline/GroupLabels.html.svelte';
	import MultiLine from '$lib/components/chart/multiline/MultiLine.svelte';
	import SharedTooltip from '$lib/components/chart/multiline/SharedTooltip.percent-range.html.svelte';
	import Table from '$lib/components/table/Table.svelte';
	import CharacterDps from '$lib/components/table/column/CharacterDPS.column.svelte';
	import CharacterHPS from '$lib/components/table/column/CharacterHPS.column.svelte';
	import CharacterName from '$lib/components/table/column/CharacterName.column.svelte';
	import Class from '$lib/components/table/column/Class.column.svelte';
	import { formatCell } from '$lib/components/table/column/cell';
	import { links } from '$lib/links';
	import { characterDps, characterHps } from '$lib/metrics';
	import { flexRender, type ColumnDef } from '@tanstack/svelte-table';

	const timeline = data.bosskill.boss_kills_maps;
	const timelineLength = timeline.length;
	const ticksGap = Math.ceil(timelineLength / 20);

	type TimelineItem = (typeof data.bosskill.boss_kills_maps)[0];
	type SeriesKey = keyof TimelineItem;
	type Series = {
		key: SeriesKey;
		label: string;
		color: string;
	}[];
	const xKey: SeriesKey = 'time';
	const yKey = 'value';
	const zKey = 'metric';
	const seriesNames: Series = [
		{
			key: 'encounterHeal',
			label: 'Enemy Healing',
			color: 'lightblue'
		},
		{
			key: 'encounterDamage',
			label: 'Enemy Damage',
			color: 'red'
		},
		{
			key: 'raidDamage',
			label: 'Raid Damage',
			color: 'gold'
		},
		{
			key: 'raidHeal',
			label: 'Raid Healing',
			color: 'green'
		}
	];
	const seriesColors = seriesNames.map((s) => s.color);
	const dataLong = seriesNames.map(({ key, label }) => {
		return {
			[zKey]: label,
			values: timeline.map((d) => {
				return {
					[yKey]: +d[key],
					[xKey]: d[xKey],
					[zKey]: key
				};
			})
		};
	});
	type DataLong = typeof dataLong;
	const formatTickX = (v: TimelineItem[typeof xKey], i: number) => {
		// TODO: fix multiple ticks at the end
		if (i === 0 || i % ticksGap === 0 || i === timelineLength - 1) {
			return `${v}s`;
		}

		return '';
	};
	const formatTickY = (d: DataLong[0]['values'][0][typeof yKey]) => {
		return format(`.${precisionFixed(d)}s`)(d);
	};

	// Table
	type T = (typeof data.bosskill.boss_kills_players)[0];
	const columns: ColumnDef<T>[] = [
		{
			id: 'name',
			accessorFn: (row) => row.name,
			header: () => 'Name',
			cell: (info) => flexRender(CharacterName, { character: info.row.original })
		},

		{
			id: 'class',
			accessorFn: (row) => row.class,
			cell: ({ row }) => {
				const { original } = row;
				return flexRender(Class, {
					character: original
				});
			},
			header: () => 'Class'
		},
		{
			id: 'dps',
			accessorFn: (row) => characterDps(row, fightLength),
			cell: (info) => flexRender(CharacterDps, { character: info.row.original, fightLength }),
			header: () => 'DPS'
		},
		{
			id: 'dmgDone',
			accessorFn: (row) => row.dmgDone,
			cell: formatCell,
			header: () => 'Dmg Done'
		},
		{
			id: 'dmgTaken',
			accessorFn: (row) => row.dmgTaken,
			cell: formatCell,
			header: () => 'Dmg Taken'
		},
		{
			id: 'dmgAbsorbed',
			accessorFn: (row) => row.dmgAbsorbed,
			cell: formatCell,
			header: () => 'Dmg Absorb'
		},
		{
			id: 'hps',
			accessorFn: (row) => characterHps(row, fightLength),
			header: () => 'HPS',
			cell: (info) =>
				flexRender(CharacterHPS, {
					character: info.row.original,
					fightLength
				})
		},
		{
			id: 'healingDone',
			accessorFn: (row) => row.healingDone,
			cell: formatCell,
			header: () => 'Healing Done'
		},
		{
			id: 'absorbDone',
			accessorFn: (row) => formatNumber(row.absorbDone),
			cell: formatCell,
			header: () => 'Absorb Done'
		},
		{
			id: 'overhealingDone',
			accessorFn: (row) => formatNumber(row.overhealingDone),
			cell: formatCell,
			header: () => 'Overheal'
		},
		{
			id: 'healingTaken',
			accessorFn: (row) => formatNumber(row.healingTaken),
			cell: formatCell,
			header: () => 'Heal Taken'
		},
		{
			id: 'interrupts',
			accessorFn: (row) => row.interrupts,
			cell: formatCell,
			header: () => 'I'
		},
		{
			id: 'dispells',
			accessorFn: (row) => row.dispels,
			cell: formatCell,
			header: () => 'D'
		},
		{
			id: 'avgItemLvl',
			accessorFn: (row) => row.avg_item_lvl,
			cell: (info) => formatAvgItemLvl(info.row.original.avg_item_lvl),
			header: () => 'Avg iLvl'
		}
	];
	const columnsUnknown = columns as any as ColumnDef<unknown>[];
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>
<h1>{title}</h1>
<LinkExternal href={links.twinstarBossKill(data.bosskill.id)}>Twinhead</LinkExternal>
<div class="grid">
	<div class="grid-boss">
		<dl>
			<dt>Boss</dt>
			<dd>
				<Link href={links.boss(data.bosskill.entry, { difficulty: data.bosskill.mode })}>
					{data.boss.name}
				</Link>
				- <LinkExternal href={links.twinstarNPC(data.bosskill.entry)}>Twinhead</LinkExternal>
			</dd>

			<dt>Raid</dt>
			<dd>{data.bosskill.map} ({data.bosskill.difficulty})</dd>

			<dt>Guild</dt>
			<dd>
				{#if data.bosskill.guild != ''}
					<LinkExternal href={links.twinstarGuild(data.bosskill.guild)}>
						{data.bosskill.guild}
					</LinkExternal>
				{:else}
					-
				{/if}
			</dd>

			<dt>Realm</dt>
			<dd>{data.bosskill.realm}</dd>

			<dt>Killed at</dt>

			<dd>{formatLocalized(data.bosskill.time)}</dd>

			<dt>Wipes</dt>
			<dd>{data.bosskill.wipes}</dd>

			<dt>Deaths</dt>
			<dd>{data.bosskill.deaths}</dd>

			<dt>Fight Length</dt>
			<dd>{formatSecondsInterval(data.bosskill.length)}</dd>

			<dt>Ressurects</dt>
			<dd>{data.bosskill.ressUsed}</dd>
		</dl>
	</div>

	<div class="grid-loot">
		<h2>Boss Loot</h2>
		{#if isRaidDifficultyWithLoot(data.bosskill.mode)}
			<div class="loot" role="table">
				{#each data.items as item, i}
					<div
						tabindex="0"
						role="row"
						class="item"
						style="--quality: var({quality(item.quality)});"
						on:mouseover={() => showTooltip(tooltipKey(item, i))}
						on:focus={() => showTooltip(tooltipKey(item, i))}
						on:mouseout={() => hideTooltip(tooltipKey(item, i))}
						on:blur={() => hideTooltip(tooltipKey(item, i))}
					>
						<img src={item.iconUrl} alt="Icon of {item.name}" width="36px" height="36px" />
						{item.name}
					</div>

					{@const tooltip = data.tooltips[item.id]}
					{#if tooltip && showTooltipById[tooltipKey(item, i)]}
						<div
							class="tooltip"
							style="--top: {i + 1}; --height: 36px; --quality: var({quality(item.quality)})"
						>
							<!-- TODO(security): iframe this -->
							<!-- https://stackoverflow.com/questions/9975810/make-iframe-automatically-adjust-height-according-to-the-contents-without-using -->
							{@html tooltip.tooltip}
						</div>
					{/if}
				{/each}
			</div>
		{:else}
			This difficulty has no loot
		{/if}
	</div>
</div>

<h2>Fight timeline</h2>
<div>
	<style>
		.chart-container {
			width: 100%;
			height: 250px;
		}
	</style>

	<div class="chart-container">
		<LayerCake
			ssr={true}
			percentRange={true}
			padding={{ top: 7, right: 10, bottom: 20, left: 25 }}
			x={xKey}
			y={yKey}
			z={zKey}
			zScale={scaleOrdinal()}
			zRange={seriesColors}
			flatData={flatten(dataLong, 'values')}
			yDomain={[0, null]}
			data={dataLong}
		>
			<Html>
				<AxisX
					gridlines={false}
					ticks={timeline.map((d) => d[xKey]).sort((a, b) => a - b)}
					formatTick={formatTickX}
					snapTicks={true}
					tickMarks={true}
				/>
				<AxisY baseline={true} formatTick={formatTickY} />
			</Html>

			<ScaledSvg>
				<MultiLine />
			</ScaledSvg>

			<Html>
				<GroupLabels />
				<SharedTooltip offset={0} dataset={timeline} />
			</Html>
		</LayerCake>
	</div>
</div>

<h2>Stats</h2>

<div>
	<Table
		data={data.bosskill.boss_kills_players}
		columns={columnsUnknown}
		sorting={[{ id: 'dmgDone', desc: true }]}
	/>
</div>

<style>
	:root {
		--loot-item-height: 3rem;
		--loot-item-margin-vertical: 0.25rem;
	}

	.grid {
		display: flex;
		flex-wrap: wrap;

		/* display: grid; */
		/* grid-template-columns: minmax(max-content, 1fr) minmax(max-content, 250px); */
		column-gap: 1rem;
	}

	.grid-boss,
	.grid-loot {
		flex-grow: 1;
	}

	.loot {
		display: grid;
		/* grid-template-columns: max-content; */
		position: relative;
	}

	.item {
		display: flex;
		align-items: center;
		padding-right: 0.5rem;
		padding-left: 2px;
		border-left: 6px solid var(--quality);
		margin: var(--loot-item-margin-vertical) 0;
	}

	.item img {
		width: 36px;
		height: 36px;
		margin-right: 0.5rem;
	}

	/* 
	.item::before {
		content: '';
		width: calc(var(--loot-item-height) / 2);
		height: calc(var(--loot-item-height) / 2);
		border-radius: 50%;
		background-color: var(--quality);
		margin: 0 0.25rem;
	} */

	.tooltip {
		position: absolute;
		padding: 0.5rem;
		left: calc(0.5rem + var(--loot-item-height) / 2);
		top: calc(
			(var(--top, 1) * var(--height, 36px)) + 2 * var(--top, 1) * var(--loot-item-margin-vertical)
		);
		/* width: 120px; */
		background-color: rgba(var(--color-bg), 0.75);
		border: 2px solid rgba(var(--quality), 0.75);
		z-index: 1;
	}
</style>
