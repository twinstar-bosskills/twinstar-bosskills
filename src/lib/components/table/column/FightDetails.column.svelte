<script lang="ts">
	import Link from '$lib/components/Link.svelte';
	import { links } from '$lib/links';
	import type { BossKill } from '$lib/model';

	export let bosskill: BossKill;
</script>

<Link href={links.bossKill(bosskill.id)}>Detail</Link>
<a href="https://mop-twinhead.twinstar.cz/?boss-kill={bosskill.id}">Twinhead</a>
