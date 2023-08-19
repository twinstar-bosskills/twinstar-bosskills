<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import Link from '$lib/components/Link.svelte';
	import { distanceTzNow, formatSecondsInterval, formatTzLocalized } from '$lib/date';
	import { links } from '$lib/links';
	import { formatValuePerSecond } from '$lib/number';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<!-- {JSON.stringify(data, null, 2)} -->

<h1>Character {data.name}</h1>
<div>
	<table>
		<thead>
			<tr>
				<th>Boss</th>
				<th>Difficulty</th>
				<th>Spec</th>
				<th>DPS</th>
				<th>HPS</th>
				<th>Fight Length</th>
				<th>Avg iLvl</th>
				<th>Killed</th>
				<th>Fight Details</th>
			</tr>
		</thead>
		<tbody>
			{#each data.bosskills as character}
				{@const bosskill = character.boss_kills}
				{#if bosskill}
					<tr>
						<td>
							<Link href={links.boss(bosskill.entry)}>
								{data.bossById[bosskill.entry]?.name ?? bosskill.entry}
							</Link>
						</td>
						<td>{bosskill.difficulty}</td>
						<td>
							<!-- TODO: API does not return class -->
							<!-- <Icon src={character.classIconUrl} label={character.classString} /> -->
							<Icon src={character.talentSpecIconUrl} label={String(character.talent_spec)} />
						</td>
						<td>{formatValuePerSecond(character.dmgDone, bosskill.length)}</td>
						<td>{formatValuePerSecond(character.healingDone, bosskill.length)}</td>
						<td>{formatSecondsInterval(bosskill.length)}</td>
						<td>{character.avg_item_lvl}</td>
						<td>{formatTzLocalized(bosskill.time)} ({distanceTzNow(bosskill.time)} ago)</td>

						<td>
							<Link href={links.bossKill(bosskill.id)}>Detail</Link>
							<a href="https://mop-twinhead.twinstar.cz/?boss-kill={bosskill.id}">Twinhead</a>
						</td>
					</tr>
				{/if}
			{/each}
		</tbody>
	</table>
</div>
