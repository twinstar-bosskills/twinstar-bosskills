<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<h1>Character {data.character.name}</h1>
<div>
	{JSON.stringify(data)}
</div>
