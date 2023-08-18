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
		margin-left: 0.5rem;
	}
</style>
