<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<h1>Characters</h1>
<div>
	<table>
		<thead>
			<tr>
				<th>guid</th>
				<th>name</th>
			</tr>
		</thead>
		<tbody>
			{#each data.characters as char}
				<tr>
					<td>{char.guid}</td>
					<td>
						<a href="/characters/{char.guid}">
							{char.name}
						</a>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
