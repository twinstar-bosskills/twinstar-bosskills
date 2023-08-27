<script lang="ts">
	import Link from '$lib/components/Link.svelte';
	import { links } from '$lib/links';
	import type { BossKill } from '$lib/model';

	export let bosskill: Pick<BossKill, 'entry' | 'mode' | 'creature_name'>;
</script>

<Link href={links.boss(bosskill.entry, { difficulty: bosskill.mode })}>
	{bosskill.creature_name ?? bosskill.entry}
</Link>
