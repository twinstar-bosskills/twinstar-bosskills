<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<h1>Bosses</h1>
<ul>
	{#each data.bosses as boss}
		<li>
			<a href="/boss/{boss.id}">{boss.name}</a>
		</li>
	{/each}
</ul>
