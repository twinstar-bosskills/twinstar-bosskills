<script lang="ts">
	import { page } from '$app/stores';
	import Link from '$lib/components/Link.svelte';
	import Table, { cellComponent } from '$lib/components/table/Table.svelte';
	import Boss from '$lib/components/table/column/Boss.column.svelte';
	import CharacterDps from '$lib/components/table/column/CharacterDPS.column.svelte';
	import CharacterHps from '$lib/components/table/column/CharacterHPS.column.svelte';
	import FightDetails from '$lib/components/table/column/FightDetails.column.svelte';
	import KilledAt from '$lib/components/table/column/KilledAt.column.svelte';
	import Spec from '$lib/components/table/column/Spec.column.svelte';
	import { formatSecondsInterval, fromServerTime } from '$lib/date';

	import LinkExternal from '$lib/components/LinkExternal.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import Rank from '$lib/components/Rank.svelte';
	import SpecIcon from '$lib/components/icon/SpecIcon.svelte';
	import { links } from '$lib/links';
	import { characterDps, characterHps } from '$lib/metrics';
	import { difficultyToString, talentSpecsByClass } from '$lib/model';
	import { formatAvgItemLvl } from '$lib/number';
	import { getPageFromURL, getPageSizeFromURL } from '$lib/pagination';
	import { getSpecsFromUrl } from '$lib/search-params';
	import type { ColumnDef } from '@tanstack/svelte-table';
	import type { PageData } from './$types';

	let pageSize = getPageSizeFromURL($page.url, 20);
	let page_ = getPageFromURL($page.url);

	export let data: PageData;

	const characterSpecs = talentSpecsByClass(data.expansion, data.character.class);
	const specs = getSpecsFromUrl($page.url, characterSpecs);
	const name = data.name;
	type T = (typeof bosskills)[0];
	const bosskills = data.bosskills.data.filter((v) => !!v.boss_kills);

	const columns: ColumnDef<T>[] = [
		{
			id: 'boss',
			accessorFn: (row) => {
				const entry = row.boss_kills?.entry ?? 0;
				return data.bossNameById[entry] ?? entry;
			},
			header: () => 'Boss',
			cell: (info) => {
				const bossId = info.row.original.boss_kills?.entry ?? 0;
				return cellComponent(Boss, {
					realm: data.realm,
					bosskill: {
						...info.row.original.boss_kills,
						creature_name: data.bossNameById[bossId] ?? bossId
					}
				});
			}
		},
		{
			id: 'difficulty',
			accessorFn: (row) => row.boss_kills?.difficulty,
			header: () => 'Difficulty'
		},
		{
			id: 'spec',
			accessorFn: (row) => row.talent_spec,
			cell: ({ row }) => {
				const { original } = row;
				return cellComponent(Spec, {
					realm: data.realm,
					character: original
				});
			},

			header: () => 'Spec'
		},
		{
			id: 'dps',
			accessorFn: (row) => characterDps(row),
			cell: (info) => {
				const boskillId = info.row.original.boss_kills?.id ?? null;
				const mode = info.row.original.boss_kills?.mode ?? null;
				let performance = null;
				if (boskillId !== null && mode !== null) {
					performance = data.performanceTrends?.[boskillId]?.[mode] ?? null;
				}
				return cellComponent(CharacterDps, { character: info.row.original, performance });
			},
			header: () => 'DPS'
		},
		{
			id: 'hps',
			accessorFn: (row) => characterHps(row),
			header: () => 'HPS',
			cell: (info) => {
				const boskillId = info.row.original.boss_kills?.id ?? null;
				const mode = info.row.original.boss_kills?.mode ?? null;
				let performance = null;
				if (boskillId !== null && mode !== null) {
					performance = data.performanceTrends?.[boskillId]?.[mode] ?? null;
				}
				return cellComponent(CharacterHps, { character: info.row.original, performance });
			}
		},
		{
			id: 'fightLength',
			accessorFn: (row) => row.boss_kills?.length ?? 0,
			cell: (info) => formatSecondsInterval(info.getValue() as number),
			header: () => 'Fight Length'
		},
		{
			id: 'avgItemLvl',
			accessorFn: (row) => row.avg_item_lvl,
			cell: (info) => formatAvgItemLvl(info.row.original.avg_item_lvl),
			header: () => 'Avg iLvl'
		},
		{
			id: 'killedAt',
			header: () => 'Killed',
			accessorFn: (row) => fromServerTime(row.boss_kills!.time),
			cell: (info) => cellComponent(KilledAt, { bosskill: info.row.original.boss_kills! })
		},
		{
			id: 'fightDetails',
			header: () => 'Fight Details',
			cell: (info) =>
				cellComponent(FightDetails, { realm: data.realm, bosskill: info.row.original.boss_kills! }),
			enableSorting: false
		}
	];
	const columnsUnknown = columns as any as ColumnDef<unknown>[];
</script>

<svelte:head>
	<title>Character {name}</title>
</svelte:head>

<div class="title">
	<h1>
		Character {name}
	</h1>
	<div>
		<Link href={links.characterPerformance(data.realm, name)}>Performance</Link>
	</div>
	<div>
		<LinkExternal href={links.twinstarArmory(data.realm, name)}>Armory</LinkExternal>
	</div>
</div>

<h2 style="margin-bottom: 0;">Overall rankings by DPS and HPS</h2>
<div style="display: flex;">
	<Link href={specs.reset} style="padding-right: 0.25rem;">Reset</Link>
	{#each specs.items as spec}
		<Link href={spec.href} style="padding: 0.25rem;">
			<SpecIcon realm={data.realm} talentSpec={spec.id} />
		</Link>
	{/each}
</div>
<div class="rankings">
	{#each Object.entries(data.bossRankings) as [type, rankings]}
		<div>
			<h3 style="margin: 0;">{type.toUpperCase()}</h3>
			<div class="by-bosses">
				{#each Object.entries(rankings) as [bossRemoteId, byMode]}
					{@const bossId = Number(bossRemoteId)}
					{@const bossName = data.bossNameById[bossId] ?? bossRemoteId}
					<div class="by-boss">
						<div style="font-weight: bold;">
							<Link href={links.boss(data.realm, bossId)}>{bossName}</Link>
						</div>
						<div class="by-diffs">
							{#each Object.entries(byMode) as [mode, item]}
								{@const diff = difficultyToString(data.expansion, mode)}
								<div>
									<Rank rank={item.rank} />
								</div>
								<div>{diff}</div>
								<div style="display: flex; align-items: center; gap: 0.125rem;">
									<SpecIcon realm={data.realm} talentSpec={item.spec} />
									<Link href={links.bossKill(data.realm, item.bosskillRemoteId)}>
										{item.value.toLocaleString()}
									</Link>
								</div>
								<div>
									{item.ilvl}ilvl
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/each}
</div>

<h2>Recent kills</h2>
<div class="table">
	<Table data={bosskills} columns={columnsUnknown} sorting={[{ id: 'killedAt', desc: true }]}>
		<svelte:fragment slot="pagination">
			<Pagination
				path={links.character(data.realm, data.name)}
				searchParams={$page.url.searchParams}
				page={page_}
				{pageSize}
				totalItems={data.bosskills.total}
			/>
		</svelte:fragment>
	</Table>
</div>

<style>
	.rankings {
		display: grid;
		gap: 0.5rem;
		grid-template-columns: 1fr 1fr;
	}
	.rankings .by-bosses {
		margin-top: 0.5rem;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
		gap: 0.25rem;
	}
	.rankings .by-boss {
		border: 1px solid rgba(var(--color-primary), 0.75);
		padding: 0.25rem;
		/* display: flex;
		flex-direction: column;
		flex-basis: 25%; */
	}
	.rankings .by-diffs {
		margin-left: 0.5rem;
		display: grid;
		align-items: center;
		grid-template-columns: repeat(4, max-content);
		gap: 0.25rem;
		padding: 0.25rem 0;
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
	@media screen and (max-width: 440px) {
		.rankings {
			grid-template-columns: 1fr;
		}
	}
</style>
