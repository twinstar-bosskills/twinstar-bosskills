<script lang="ts">
	import Link from '$lib/components/Link.svelte';
	import LinkExternal from '$lib/components/LinkExternal.svelte';
	import CharacterPerformanceChart from '$lib/components/echart/CharacterPerformanceChart.svelte';
	import FilterForm from '$lib/components/form/FilterForm.svelte';
	import { links } from '$lib/links';
	import { difficultyToString, talentSpecsByClass } from '$lib/model';
	import { realmToExpansion } from '$lib/realm';
	import { number } from 'zod';
	import type { PageData } from './$types';

	export let data: PageData;
	const realm = data.realm;
	const expansion = realmToExpansion(data.realm);
	const name = data.character.name;
	const performanceLines = Object.entries(data.performanceLines);
	const spec = data.spec;
</script>

<svelte:head>
	<title>{name}'s performance over time</title>
</svelte:head>

<div class="title">
	<h1>
		{name}'s performance over time
	</h1>
	<div>
		<Link href={links.character(realm, name)}>Recent kills</Link>
	</div>
	<div>
		<LinkExternal href={links.twinstarArmory(realm, name)}>Armory</LinkExternal>
	</div>
</div>

<FilterForm
	data={data.form.data}
	values={data.form.values}
	realm={data.realm}
	action={links.characterPerformance(data.realm, name)}
/>

{#if performanceLines.length === 0}
	<h3>No performance records found yet</h3>
{:else}
	{#each performanceLines as [bossId, byMode]}
		{#each Object.entries(byMode) as [mode, line]}
			{@const name = line[0]?.bossName ?? bossId}
			{@const bossIdNum = Number(bossId)}
			{@const diff = difficultyToString(expansion, mode)}
			{@const median =
				spec !== null ? data.medianByBossId?.[bossIdNum]?.[Number(mode)]?.[spec] : undefined}
			<div>
				<h3>
					Performance on
					<Link href={links.boss(realm, bossIdNum, { difficulty: mode })}>{name} ({diff})</Link>
				</h3>
				<CharacterPerformanceChart data={line} {median} />
			</div>
		{/each}
	{/each}
{/if}

<style>
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
