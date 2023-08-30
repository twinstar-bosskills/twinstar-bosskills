<script lang="ts">
	import { page } from '$app/stores';
	import Link from '$lib/components/Link.svelte';
	import LinkExternal from '$lib/components/LinkExternal.svelte';
	import SelectCharacter from '$lib/components/SelectCharacter.svelte';
	import { links } from '$lib/links';
	import type { LayoutData } from './$types';
	export let data: LayoutData;
</script>

<div class="top">
	<nav>
		<ul>
			<li>
				<Link href="/">Home</Link>
			</li>
			<li>
				<Link href={links.BOSS_KILLS}>Latest</Link>
			</li>
			<li>
				<Link href={links.RAIDS}>Raids</Link>
			</li>
		</ul>
	</nav>
	<div class="select-character">
		<SelectCharacter
			redirectUrl={$page.url.pathname + $page.url.search + $page.url.hash}
			character={data.character}
		/>
	</div>
</div>

<main>
	<slot />
</main>

<footer>
	Made by hop and hopefully some others, maybe you?
	<LinkExternal href="https://github.com/twinstar-bosskills/twinstar-bosskills">
		We are open source
	</LinkExternal>
</footer>

<style>
	:global(:root) {
		--color-fg: whitesmoke;
		--color-bg: 0, 0, 0;
		--color-primary: goldenrod;
		--color-secondary: hsl(43 89% 50% / 1);

		--color-success: lawngreen;
		--color-error: orangered;
		--color-warning: orange;

		--color-q: #ffd100 !important;
		--color-q0: #9d9d9d !important;
		--color-q1: #fff !important;
		--color-q2: #1eff00 !important;
		--color-q3: #0070dd !important;
		--color-q4: #a335ee !important;
		--color-q5: #ff8000 !important;
		--color-q6: #e5cc80 !important;
		--color-q7: #e5cc80 !important;
		--color-q8: #ffff98 !important;
		--color-q9: #71d5ff !important;
		--color-q10: #f00 !important;

		--color-r1: #ff8040 !important;
		--color-r2: #ff0 !important;
		--color-r3: #40bf40 !important;

		--color-r4: #808080 !important;
	}
	:global(h1) {
		margin: 1rem 0;
	}

	:global(*) {
		box-sizing: border-box;

		scrollbar-color: rgba(var(--color-bg), 0.75) var(--color-primary);
		/* scrollbar-width: thin; */
	}

	:global(::-webkit-scrollbar) {
		width: 0.75rem;
		height: 0.75rem;
	}

	:global(::-webkit-scrollbar-track) {
		background: var(--color-primary);
	}

	:global(::-webkit-scrollbar-thumb) {
		background: rgba(var(--color-bg), 0.75);
	}

	:global(::-webkit-scrollbar-thumb:hover) {
		background: rgba(var(--color-bg), 1);
	}

	:global(body) {
		font-size: 14px;
		max-width: 1920px;
		padding: 0.5rem;
		margin: 0px auto;

		font-family: 'Helvetica', 'Arial', sans-serif;

		width: 100%;
		min-height: 100vh;

		/* background: url('/bg-1.blur.darken.png'); */
		/* background-repeat: no-repeat; */
		/* background-size: cover; */
		/* backdrop-filter: blur(12px); */
		/* background-color: rgba(0, 0, 0, 0.5); */
		background-color: rgb(27 27 27);

		color: var(--color-fg);
	}

	:global(a) {
		color: var(--color-primary);
	}

	:global(a:visited) {
		color: var(--color-secondary);
	}

	:global(table) {
		display: block;
		overflow-x: auto;
		table-layout: fixed;
		white-space: nowrap;
		width: 100%;
		border-collapse: collapse;
	}

	:global(table th) {
		color: var(--color-primary);
	}

	:global(table tbody tr:nth-child(even)) {
		background: rgba(var(--color-bg), 0.75);
	}

	:global(table tr td, table tr th) {
		border: 1px solid rgba(var(--color-bg), 0.3);
		padding: 0.5rem 0.75rem;
	}

	:global(ul, ol) {
		margin: 0;
		padding: 0;
	}

	:global(li) {
		margin: 0;
		padding: 0;
		text-indent: 0;
		list-style-type: none;
	}

	.top {
		display: grid;
		gap: 0.5rem;
		grid-template-columns: 1fr max-content;

		font-size: 1.25rem;

		padding-bottom: 0.5rem;
		border-bottom: 2px solid var(--color-primary);
	}

	.select-character {
		padding: 0.25rem 0;
		display: flex;
		align-items: center;
	}

	:global(nav a) {
		text-decoration: none;
		color: var(--color-primary);
	}

	nav {
		display: flex;
		align-items: center;
	}

	nav ul {
		display: flex;
	}

	nav ul li {
		padding: 0.25rem 0;
		margin-right: 0.5rem;
	}

	footer {
		/* TODO: move this to bottom, but not with position: fixed */
		padding: 0.5rem;
		text-align: center;
		font-size: 75%;
		color: gray;
	}

	@media (max-width: 480px) {
		.top {
			grid-template-columns: 1fr;
		}
	}
</style>
