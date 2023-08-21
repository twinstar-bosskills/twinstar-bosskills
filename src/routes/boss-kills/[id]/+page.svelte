<script lang="ts">
	import { quality } from '$lib/css-vars';
	import { formatLocalized, formatSecondsInterval } from '$lib/date';
	import { isRaidDifficultyWithLoot, type Item } from '$lib/model';
	import { formatAvgItemLvl, formatNumber } from '$lib/number';

	import type { PageData } from './$types';

	export let data: PageData;

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

	import AxisX from '$lib/components/chart/multiline/AxisX.html.svelte';
	import AxisY from '$lib/components/chart/multiline/AxisY.html.svelte';
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

<h1>Boss Kill Details - {data.bosskill.id}</h1>
<a href={links.twinstarBossKill(data.bosskill.id)} about="_blank" rel="noopener"> Twinhead </a>
<div class="grid">
	<div>
		<dl>
			<dt>Boss</dt>
			<dd>
				<a href="https://mop-twinhead.twinstar.cz/?npc={data.bosskill.entry}">
					{data.boss.name}
				</a>
			</dd>

			<dt>Raid</dt>
			<dd>{data.bosskill.map}</dd>

			<dt>Guild</dt>
			<dd>
				{#if data.bosskill.guild != ''}
					<a
						href="https://mop-twinhead.twinstar.cz/?guild={encodeURIComponent(
							data.bosskill.guild
						)}&realm={data.bosskill.realm}"
					>
						{data.bosskill.guild}
					</a>
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

	<div>
		<h2>Boss Loot</h2>
		{#if isRaidDifficultyWithLoot(data.bosskill.mode)}
			<div role="table">
				{#each data.items as item, i}
					<div
						tabindex="0"
						role="row"
						class="item"
						style="border: 2px solid var({quality(item.quality)})"
						on:mouseover={() => showTooltip(tooltipKey(item, i))}
						on:focus={() => showTooltip(tooltipKey(item, i))}
						on:mouseout={() => hideTooltip(tooltipKey(item, i))}
						on:blur={() => hideTooltip(tooltipKey(item, i))}
					>
						<img src={item.iconUrl} alt="Icon of {item.name}" width="36" height="36" />
						{item.name}
					</div>

					{@const tooltip = data.tooltips[item.id]}
					{#if tooltip && showTooltipById[tooltipKey(item, i)]}
						<div class="tooltip" style="border: 2px solid var({quality(item.quality)})">
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
		/*
		  The wrapper div needs to have an explicit width and height in CSS.
		  It can also be a flexbox child or CSS grid element.
		  The point being it needs dimensions since the <LayerCake> element will
		  expand to fill it.
		*/
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
	<Table data={data.bosskill.boss_kills_players} columns={columnsUnknown} />
	<!-- <table>
		<thead>
			<tr>
				<th>Name</th>
				<th>Class</th>
				<th>DPS</th>
				<th>Dmg Done</th>
				<th>Dmg Taken</th>
				<th>Dmg Absorb</th>
				<th>HPS</th>
				<th>Healing Done</th>
				<th>Absorb Done</th>
				<th>Overheal</th>
				<th>Heal Taken</th>
				<th>I</th>
				<th>D</th>
				<th>Avg iLvl</th>
			</tr>
		</thead>
		<tbody>
			{#each data.bosskill.boss_kills_players as character}
				<tr>
					<td>
						<Link href={links.character(character.name)}>{character.name}</Link>
					</td>
					<td>
						<Icon src={character.classIconUrl} label={character.classString} />
						<Icon src={character.talentSpecIconUrl} label={String(character.talent_spec)} />
						<Icon src={character.raceIconUrl} label={String(character.raceString)} />
					</td>
					<td>{formatNumber(characterDps(character))}</td>
					<td>{formatNumber(character.dmgDone)}</td>
					<td>{formatNumber(character.dmgTaken)}</td>
					<td>{formatNumber(character.dmgAbsorbed)}</td>
					<td>{formatNumber(characterHps(character))}</td>
					<td>{formatNumber(character.healingDone)}</td>
					<td>{formatNumber(character.absorbDone)}</td>
					<td>{formatNumber(character.overhealingDone)}</td>
					<td>{formatNumber(character.healingTaken)}</td>
					<td>{character.interrupts}</td>
					<td>{character.dispels}</td>
					<td>{character.avg_item_lvl}</td>
				</tr>
			{/each}
		</tbody>
	</table> -->
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		column-gap: 1rem;
	}
	.item {
		display: flex;
		align-items: center;
	}
	.item img {
		width: 36px;
		height: 36px;
	}
	.tooltip {
		position: absolute;
		background: white;
	}
</style>
