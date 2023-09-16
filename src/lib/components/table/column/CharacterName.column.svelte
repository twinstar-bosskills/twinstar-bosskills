<script lang="ts">
	import Link from '$lib/components/Link.svelte';
	import { links } from '$lib/links';
	import type { Character } from '$lib/model';

	export let character: Character;
	export let rank: number | undefined = undefined;
</script>

<div>
	<Link href={links.character(character.name)}>{character.name}</Link>
	{typeof rank === 'number' ? ` #${rank}` : ''}
</div>
