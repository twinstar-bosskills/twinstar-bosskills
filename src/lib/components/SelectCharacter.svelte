<script lang="ts">
	import type { CharacterShort } from '$lib/model';
	import { mutateCharacterShort } from '$lib/model';
	import { onMount, onDestroy } from 'svelte';

	export let redirectUrl: string = '/';
	export let character: string = '';

	let searchResults: CharacterShort[] = [];
	let searching = false;
	let searchIsFocused = false;
	let debounceTimer: number;
	let controller = new AbortController();

	//Click handlers for autocomplete visibility
	onMount(() => {
		if (typeof window !== 'undefined') {
			window.addEventListener('click', handleClickOutside);
		}
	});

	//Destroy listener with component to avoid memleaks
	onDestroy(() => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('click', handleClickOutside);
		}
	});

	function handleClickOutside() {
		var searchField = document.getElementById('character');
		searchIsFocused = document.activeElement === searchField;
		if (searchIsFocused && searchResults?.length === 0) performSearch();
	}

	function debounce(func: () => void, delay: number) {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(func, delay);
	}

	function splitByQuery(name: string) {
		const regex = new RegExp(`(${character})`, 'gi');
		//Find query string in the character name, split to parts and remove split "" artifacts
		const parts = name
			.toLowerCase()
			.split(regex)
			.filter((el) => el !== '');

		//Return name with highlights as html
		const highlighted = parts
			.map((part, index) =>
				part.toLowerCase() === character.toLowerCase()
					? `<span style="color: var(--color-primary)">${
							index == 0 ? part.charAt(0).toUpperCase() + part.slice(1) : part
					  }</span>`
					: index == 0
					? part.charAt(0).toUpperCase() + part.slice(1)
					: part
			)
			.join('');

		return highlighted;
	}

	//If valid query
	//TODO: regex validation for Blizz format charname (3-16 letters only?)
	async function performSearch() {
		if (character.trim() === '' || character.trim().length < 3) {
			searching = false;
			return;
		}

		searching = true;
		searchResults = [];

		//Kill old request to avoid race conditions
		controller.abort();
		controller = new AbortController();

		//10 should be enough
		//TODO: add guilds to search ?
		const response = await fetch(
			`https://twinstar-api.twinstar-wow.com/characters?page=0&pageSize=10&name=${encodeURIComponent(
				character
			)}&realms=Helios`,
			{ signal: controller.signal }
		);
		const data = await response.json();

		//Grab char icons and only 90 level chars for now
		data.data.map((el: CharacterShort) => mutateCharacterShort(el));
		searchResults = data.data.filter((el: CharacterShort) => el.level === 90);
		searching = false;
	}
</script>

<div>
	<form method="POST" action="/characters?/select">
		<label for="character"> Character </label>
		<input
			type="text"
			id="character"
			autocomplete="off"
			autocapitalize="words"
			bind:value={character}
			on:input={() => {
				if (character.length >= 3) {
					searching = true;
					searchResults = [];
					debounce(performSearch, 300);
				} else {
					searching = false;
					searchResults = [];
				}
			}}
		/>
		<ul hidden={!searchIsFocused} class="searchResult">
			{#if searching}
				<li
					style="width: 100%;
					text-align: center;"
				>
					<div class="loader" />
				</li>
			{/if}
			{#each searchResults as result}
				<li style="margin-bottom: 0.5rem">
					<img
						style="margin-right: 0.5rem"
						width="20"
						height="20"
						src={result.classIconUrl}
						alt="character class icon"
					/>
					<button name="character" class="hidden-btn" value={result.name}
						>{@html splitByQuery(result.name)}</button
					>
				</li>
			{/each}
		</ul>
		<input type="hidden" name="redirectUrl" value={redirectUrl} />
	</form>
</div>

<style>
	.searchResult {
		position: absolute;
		width: 200px;
		background: #1e1e1e;
		z-index: 20;
		right: 0.5rem;
		top: 3rem;
	}
	.hidden-btn {
		background: none;
		border: none;
		padding: 0;
		margin: 0;
		color: white;
		font-size: unset;
	}
	.loader {
		border: 0.25rem solid rgba(0, 0, 0, 0.1);
		border-top: 0.25rem solid var(--color-primary);
		border-radius: 50%;
		width: 2rem;
		height: 2rem;
		margin: 0 auto;
		animation: spin 2s linear infinite;
	}

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

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	@media (max-width: 320px) {
		input {
			/* max-width: 160px; */
			margin-left: 0;
		}
		form {
			display: flex;
			flex-direction: column;
		}
	}
</style>
