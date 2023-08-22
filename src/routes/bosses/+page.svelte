<script lang="ts">
	import Link from '$lib/components/Link.svelte';
	import { links } from '$lib/links';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head>
	<title>Bosses</title>
</svelte:head>
<h1>Bosses</h1>
<ul>
	{#each data.bosses as boss}
		<li>
			<Link href={links.boss(boss.entry)}>{boss.name}</Link>
		</li>
	{/each}
</ul>
