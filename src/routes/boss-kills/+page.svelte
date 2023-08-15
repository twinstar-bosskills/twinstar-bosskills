<script lang="ts">
	import { page } from '$app/stores';
	import { formatLocalized, formatSecondsInterval } from '$lib/date';
	import { getPageFromURL, getPageSizeFromURL } from '$lib/paginations';
	import Link from '../../components/Link.svelte';
	import Pagination from '../../components/Pagination.svelte';
	import type { PageData } from './$types';

	let pageSize = getPageSizeFromURL($page.url);
	let page_ = getPageFromURL($page.url);

	export let data: PageData;
</script>

<h1>Latest Bosskills</h1>
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
			{#each data.latest.data as bosskill}
				<tr>
					<td>
						<Link href="/boss/{bosskill.entry}">
							{bosskill.creature_name}
						</Link>
					</td>
					<td>{bosskill.map}</td>
					<td>{bosskill.difficulty}</td>
					<td>{bosskill.guild == '' ? `Mixed group <${bosskill.realm}>` : bosskill.guild}</td>
					<td>{formatSecondsInterval(bosskill.length)}</td>
					<td>{formatLocalized(bosskill.time)}</td>

					<td>
						<Link href="/boss-kills/{bosskill.id}">Detail</Link>
						<a href="https://mop-twinhead.twinstar.cz/?boss-kill={bosskill.id}">Twinhead</a>
					</td>
				</tr>
			{/each}
		</tbody>
		<tfoot>
			<tr>
				<td colspan="7">
					<Pagination page={page_} {pageSize} totalItems={data.latest.total} />
				</td>
			</tr>
		</tfoot>
	</table>
</div>
