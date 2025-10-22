<script lang="ts">
	import Link from '$lib/components/Link.svelte';
	import LinkExternal from '$lib/components/LinkExternal.svelte';
	import { links } from '$lib/links';
	import { REALM_HELIOS } from '$lib/realm';
	import type { BossKill } from '@twinstar-bosskills/api/dist/schema';

	export let realm: string = REALM_HELIOS;
	export let bosskill: BossKill;
</script>

<Link href={links.bossKill(realm, bosskill.id)} style="margin-right: 0.5rem;">Detail</Link>
<LinkExternal href={links.twinstarBossKill(realm, bosskill.id)}>Twinhead</LinkExternal>
