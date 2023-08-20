<script lang="ts">
	import Link from '$lib/components/Link.svelte';
	import { links } from '$lib/links';
	import type { BossKill } from '$lib/model';

	export let bosskill: BossKill;
	// data.bossById[bosskill.entry]?.name ?? bosskill.entry
</script>

<Link href={links.boss(bosskill.entry)}>
	{bosskill.creature_name ?? bosskill.entry}
</Link>
