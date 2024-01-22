<script lang="ts">
	import Link from '$lib/components/Link.svelte';
	import { links } from '$lib/links';
	import { REALM_HELIOS } from '$lib/realm';
	import type { BosskillCharacter } from '$lib/server/api/schema';

	export let realm: string = REALM_HELIOS;
	export let character: BosskillCharacter;
	export let rank: number | undefined = undefined;
</script>

<div>
	<Link href={links.character(realm, character.name)}>{character.name}</Link>
	{typeof rank === 'number' ? ` #${rank}` : ''}
</div>
