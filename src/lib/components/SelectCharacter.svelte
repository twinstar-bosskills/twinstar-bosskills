<script lang="ts">
	import { REALM_HELIOS } from '$lib/realm';

	export let realm: string = REALM_HELIOS;
	export let redirectUrl: string = '/';
	export let character: string = '';
</script>

<form method="POST" action="/{realm}/characters?/select">
	<label for="character"> Character </label>
	<input type="text" id="character" name="character" value={character} />
	<input type="hidden" name="redirectUrl" value={redirectUrl} />
</form>

<style>
	form {
		display: flex;
	}

	label {
		display: flex;
		align-items: center;
	}

	input {
		font-size: 1.5rem;
		max-width: 200px;
		margin-left: 0.5rem;
	}

	@media (max-width: 320px) {
		input {
			margin-left: 0;
		}
		form {
			display: flex;
			flex-direction: column;
		}
	}
	@media (max-width: 220px) {
		input {
			max-width: 140px;
		}
	}
</style>
