<script lang="ts">
	import type { BossKill } from '@twinstar-bosskills/api/dist/schema';
	export let bosskill: Pick<BossKill, 'guild' | 'realm'>;
</script>

{bosskill.guild == '' ? `Mixed group <${bosskill.realm}>` : bosskill.guild}
