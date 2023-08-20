<script lang="ts">
	import { formatTzLocalized } from '$lib/date';
	import type { PageData } from './$types';

	export let data: PageData;

	type ByData = {
		key: string;
		value: number;
	};
	const byWeekDay: ByData[] = [];
	for (const [key, value] of Object.entries(data.byWeekDay)) {
		byWeekDay.push({ key, value });
	}
	byWeekDay.sort((a, b) => b.value - a.value);

	const byHour: ByData[] = [];
	for (const [key, value] of Object.entries(data.byHour)) {
		byHour.push({ key, value });
	}
	byHour.sort((a, b) => b.value - a.value);
</script>

<h1>Welcome to Bosskills</h1>

{#if data.first && data.last}
	<h2>
		Bosskills between {formatTzLocalized(data.first.time)} and {formatTzLocalized(data.last.time)}
	</h2>
	<h3>Number of bosskills grouped by day of week</h3>
	<ul>
		{#each byWeekDay as { key, value }, i}
			<li class:top={i === 0}>
				{key}: {value}
				{#if i === 0}
					(top raiding day)
				{/if}
			</li>
		{/each}
	</ul>
	<h3>Number of bosskills grouped by hour</h3>
	<ul>
		{#each byHour as { key, value }, i}
			<li class:top={i === 0}>
				{key}: {value}
				{#if i === 0}
					(top raiding hour)
				{/if}
			</li>
		{/each}
	</ul>
{/if}
<h2>Info</h2>
<h3>DPS and HPS</h3>
<p>DPS and HPS numbers might be slightly different from the ones you can see on Twinhead.</p>
<p>We are dividing the value by usefullTime when calculating the average.</p>

<!-- <h2>Highlights</h2>
<h3>Best damager of the week: TODO</h3>
<h3>Best healer of the week: TODO</h3> -->
<style>
	.top {
		font-weight: bold;
	}
</style>
