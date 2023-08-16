<script lang="ts">
	import Link from '$lib/components/Link.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<h1>Bosses</h1>
<ul>
	{#each data.bosses as boss}
		<li>
			<Link href="/boss/{boss.entry}">{boss.name}</Link>
		</li>
	{/each}
</ul>
