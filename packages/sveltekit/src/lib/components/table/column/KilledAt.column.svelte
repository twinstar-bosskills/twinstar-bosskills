<script lang="ts">
	import { distanceTzNow, formatTzLocalized } from '@twinstar-bosskills/core/dist/date';
	import type { BossKill } from '@twinstar-bosskills/api/dist/schema';

	export let bosskill: BossKill;
	$: time = bosskill.time;
</script>

<span title={formatTzLocalized(time)}>{distanceTzNow(time)}</span>
