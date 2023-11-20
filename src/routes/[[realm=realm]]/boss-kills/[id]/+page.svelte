<script lang="ts">
	import { quality } from '$lib/css-vars';
	import { formatLocalized, formatSecondsInterval } from '$lib/date';
	import { isRaidDifficultyWithLoot, type Character, type Item } from '$lib/model';
	import { formatAvgItemLvl, formatNumber } from '$lib/number';

	import type { PageData } from './$types';

	export let data: PageData;

	const realm = data.realm;
	const expansion = realmToExpansion(realm);
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

	import Link from '$lib/components/Link.svelte';
	import LinkExternal from '$lib/components/LinkExternal.svelte';
	import BossKillDetailsChart from '$lib/components/echart/BossKillDetailsChart.svelte';
	import Table, { cellComponent } from '$lib/components/table/Table.svelte';
	import CharacterDps from '$lib/components/table/column/CharacterDPS.column.svelte';
	import CharacterHPS from '$lib/components/table/column/CharacterHPS.column.svelte';
	import CharacterName from '$lib/components/table/column/CharacterName.column.svelte';
	import Class from '$lib/components/table/column/Class.column.svelte';
	import { formatCell } from '$lib/components/table/column/cell';
	import { links } from '$lib/links';
	import { characterDps, characterHps } from '$lib/metrics';
	import type { ColumnDef } from '@tanstack/svelte-table';
	import { realmToExpansion } from '$lib/realm';

	const charactersByGUID = data.bosskill.boss_kills_players?.reduce((acc, item) => {
		acc[item.guid] = item;
		return acc;
	}, {} as Record<number, Character>);
	const timeline = data.bosskill.boss_kills_maps;
	const deaths = data.bosskill.boss_kills_deaths;

	const seriesEncounterDamage: number[] = [];
	const seriesEncounterHeal: number[] = [];
	const seriesRaidDamage: number[] = [];
	const seriesRaidHeal: number[] = [];
	const seriesDeaths: any[] = [];
	const seriesRessurects: any[] = [];
	const xAxisData: number[] = [];
	for (const item of timeline) {
		xAxisData.push(item.time);

		seriesEncounterDamage.push(+item.encounterDamage);
		seriesEncounterHeal.push(+item.encounterHeal);
		seriesRaidDamage.push(+item.raidDamage);
		seriesRaidHeal.push(+item.raidHeal);
	}
	xAxisData.sort((a, b) => a - b);

	for (const item of deaths) {
		const player = charactersByGUID[item.guid] ?? 'Unknown';
		const index = Math.abs(item.time);
		if (item.time < 0) {
			if (typeof seriesRessurects[index] !== 'undefined') {
				seriesRessurects[index].value++;
				seriesRessurects[index].players.push(player);
			} else {
				seriesRessurects[index] = { value: 1, players: [player] };
			}
		} else {
			if (typeof seriesDeaths[index] !== 'undefined') {
				seriesDeaths[index].value++;
				seriesDeaths[index].players.push(player);
			} else {
				seriesDeaths[index] = { value: 1, players: [player] };
			}
		}
	}

	// Table
	type T = (typeof data.bosskill.boss_kills_players)[0];
	const columns: ColumnDef<T>[] = [
		{
			id: 'name',
			accessorFn: (row) => row.name,
			header: () => 'Name',
			cell: (info) =>
				cellComponent(CharacterName, { realm: data.realm, character: info.row.original })
		},

		{
			id: 'class',
			accessorFn: (row) => row.class,
			cell: ({ row }) => {
				const { original } = row;
				return cellComponent(Class, {
					character: original
				});
			},
			header: () => 'Class'
		},
		{
			id: 'dps',
			accessorFn: (row) => characterDps(row, fightLength),
			cell: (info) => cellComponent(CharacterDps, { character: info.row.original, fightLength }),
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
				cellComponent(CharacterHPS, {
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
<div class="title">
	<h1>{title}</h1>
	<LinkExternal href={links.twinstarBossKill(realm, data.bosskill.id)}>Twinhead</LinkExternal>
</div>
<div class="grid">
	<div class="grid-boss">
		<dl>
			<dt>Boss</dt>
			<dd>
				<Link
					href={links.boss(data.realm, data.bosskill.entry, { difficulty: data.bosskill.mode })}
				>
					{data.boss.name}
				</Link>
				- <LinkExternal href={links.twinstarNPC(realm, data.bosskill.entry)}>Twinhead</LinkExternal>
			</dd>

			<dt>Raid</dt>
			<dd>{data.bosskill.map} ({data.bosskill.difficulty})</dd>

			<dt>Guild</dt>
			<dd>
				{#if data.bosskill.guild != ''}
					<LinkExternal href={links.twinstarGuild(realm, data.bosskill.guild)}>
						{data.bosskill.guild}
					</LinkExternal>
				{:else}
					-
				{/if}
			</dd>

			<dt>Realm</dt>
			<dd>{data.bosskill.realm}</dd>

			<dt>Killed</dt>
			<dd>{formatLocalized(data.bosskill.time)}</dd>

			<dt>Avg iLvl</dt>
			<dd>{formatAvgItemLvl(data.bosskillAvgItemLvl)}</dd>

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
		{#if isRaidDifficultyWithLoot(expansion, data.bosskill.mode)}
			<div class="loot" role="table">
				{#each data.items as item, i}
					{@const chance = data.lootChance[item.id] ?? null}
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
						{#if chance != null}
							<div style="margin-left: 0.25rem; color: var(--color-warning)">
								({chance.count.toLocaleString()} of {chance.total.toLocaleString()} ~ {chance.chance.toLocaleString()}%)
							</div>
						{/if}
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
	<BossKillDetailsChart
		width={data.windowInnerWidth}
		{xAxisData}
		{seriesEncounterDamage}
		{seriesEncounterHeal}
		{seriesRaidDamage}
		{seriesRaidHeal}
		{seriesDeaths}
		{seriesRessurects}
	/>
</div>

<h2>Stats</h2>

<div>
	<Table
		data={data.bosskill.boss_kills_players}
		columns={columnsUnknown}
		sorting={[{ id: 'dps', desc: true }]}
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
	.title {
		margin: 1rem 0;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		column-gap: 1rem;
		row-gap: 0.5rem;
	}
	.title h1 {
		margin: 0;
	}
</style>
