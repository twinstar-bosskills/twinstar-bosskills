<script lang="ts">
	import Link from '$lib/components/Link.svelte';
	import { links } from '$lib/links';
	import { REALM_HELIOS } from '$lib/realm';
	import type { BossKill } from '@twinstar-bosskills/api/dist/schema';

	export let realm: string = REALM_HELIOS;
	export let bosskill: Pick<BossKill, 'entry' | 'mode' | 'creature_name'>;
</script>

<Link href={links.boss(realm, bosskill.entry, { difficulty: bosskill.mode })}>
	{bosskill.creature_name ?? bosskill.entry}
</Link>
