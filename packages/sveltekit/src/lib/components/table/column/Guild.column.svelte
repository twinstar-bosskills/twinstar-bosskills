<script lang="ts">
	import type { BossKill } from '$lib/server/api/schema';
	export let bosskill: Pick<BossKill, 'guild' | 'realm'>;
</script>

{bosskill.guild == '' ? `Mixed group <${bosskill.realm}>` : bosskill.guild}
