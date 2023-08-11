<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<h1>Latest bosskills</h1>
<div>
	<table>
		<thead>
			<tr>
				<th>id</th>
				<th>boss</th>
				<th>map</th>
				<th>mode</th>
				<th>guild</th>
				<th>details</th>
			</tr>
		</thead>
		<tbody>
			{#each data.latest as bosskill}
				<tr>
					<td>{bosskill.id}</td>
					<td>
						<a href="https://mop-twinhead.twinstar.cz/?npc={bosskill.entry}">
							boss {bosskill.entry}
						</a>
					</td>
					<td>{bosskill.map}</td>
					<td>{bosskill.mode}</td>
					<td>{bosskill.guild}</td>
					<td>
						<a href="/boss-kills/{bosskill.id}">Detail</a>
						<a href="https://mop-twinhead.twinstar.cz/?boss-kill={bosskill.id}">Twinhead</a>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
