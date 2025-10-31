<script lang="ts">
	import Link from '$lib/components/Link.svelte';
	import { links } from '$lib/links';
	import type { Boss } from '@twinstar-bosskills/db/dist/types';
	import { REALM_HELIOS } from '@twinstar-bosskills/core/dist/realm';

	export let realm: string = REALM_HELIOS;
	export let boss: Boss;
	export let difficulty: number | undefined = undefined;
</script>

<Link href={links.boss(realm, boss.remote_id, { difficulty })}>
	{boss.name}
</Link>
