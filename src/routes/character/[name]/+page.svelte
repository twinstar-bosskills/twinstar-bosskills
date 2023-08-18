<script lang="ts">
	import Link from '$lib/components/Link.svelte';
	import { distanceTzNow, formatSecondsInterval, formatTzLocalized } from '$lib/date';
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
				<th>Raid</th>
				<th>Difficulty</th>
				<th>Guild</th>
				<th>Fight Length</th>
				<th>Killed</th>
				<th>Details</th>
			</tr>
		</thead>
		<tbody>
			{#each data.bosskills as item}
				{@const bosskill = item.boss_kills}
				{#if bosskill}
					<tr>
						<td>
							<Link href="/boss/{bosskill.entry}">
								{bosskill.entry}
							</Link>
						</td>
						<td>{bosskill.map}</td>
						<td>{bosskill.difficulty}</td>
						<td>{bosskill.guild == '' ? `Mixed group <${bosskill.realm}>` : bosskill.guild}</td>
						<td>{formatSecondsInterval(bosskill.length)}</td>
						<td>{formatTzLocalized(bosskill.time)} ({distanceTzNow(bosskill.time)} ago)</td>

						<td>
							<Link href="/boss-kills/{bosskill.id}">Detail</Link>
							<a href="https://mop-twinhead.twinstar.cz/?boss-kill={bosskill.id}">Twinhead</a>
						</td>
					</tr>
				{/if}
			{/each}
		</tbody>
	</table>
</div>
