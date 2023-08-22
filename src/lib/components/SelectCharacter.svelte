<script lang="ts">
	export let redirectUrl: string = '/';
	export let character: string = '';
</script>

<form method="POST" action="/characters?/select">
	<label>
		Character <input type="text" name="character" value={character} />
	</label>
	<input type="hidden" name="redirectUrl" value={redirectUrl} />
</form>

<style>
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
			max-width: 160px;
		}
	}
</style>
