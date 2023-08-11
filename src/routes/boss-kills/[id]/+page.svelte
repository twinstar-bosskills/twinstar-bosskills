<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<h1>Bosskill {data.bosskill.id}</h1>
<div>
	{JSON.stringify(data)}
</div>
