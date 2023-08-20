<script lang="ts">
	import Link from '$lib/components/Link.svelte';
	import { links } from '$lib/links';
	import type { Character } from '$lib/model';

	export let character: Character;
</script>

<Link href={links.character(character.name)}>{character.name}</Link>
