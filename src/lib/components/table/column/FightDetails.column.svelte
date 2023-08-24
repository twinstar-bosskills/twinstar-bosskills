<script lang="ts">
	import Link from '$lib/components/Link.svelte';
	import LinkExternal from '$lib/components/LinkExternal.svelte';
	import { links } from '$lib/links';
	import type { BossKill } from '$lib/model';

	export let bosskill: BossKill;
</script>

<Link href={links.bossKill(bosskill.id)} style="margin-right: 0.5rem;">Detail</Link>
<LinkExternal href={links.twinstarBossKill(bosskill.id)}>Twinhead</LinkExternal>
