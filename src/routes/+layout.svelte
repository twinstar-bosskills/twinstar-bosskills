<script lang="ts">
	import { building, dev } from '$app/environment';
	import { page } from '$app/stores';
	import Link from '$lib/components/Link.svelte';
	import LinkExternal from '$lib/components/LinkExternal.svelte';
	import SelectCharacter from '$lib/components/SelectCharacter.svelte';
	import SelectRealm from '$lib/components/SelectRealm.svelte';
	import { links } from '$lib/links';
	import type { LayoutData } from './$types';
	export let data: LayoutData;

	const bklink = links.bossKills(data.realm);
	const raidsLink = links.raids(data.realm);
</script>

<svelte:head>
	{#if !dev && !building}
		<script
			defer
			src="https://eu.umami.is/script.js"
			data-website-id="800b4377-90d9-48d2-adf8-a1b0cd7672bd"
		></script>
	{/if}
</svelte:head>
<div class="top">
	<div class="select-realm">
		<SelectRealm realm={data.realm} />
	</div>
	<nav>
		<ul>
			<!-- <li>
				<Link href="/{data.realm}">Home</Link>
			</li> -->
			<li>
				<Link href={bklink} active={$page.url.pathname === bklink}>Latest</Link>
			</li>
			<li>
				<Link href={raidsLink} active={$page.url.pathname === raidsLink}>Raids</Link>
			</li>
		</ul>
	</nav>

	<div class="select-character">
		<SelectCharacter
			realm={data.realm}
			redirectUrl={$page.url.pathname + $page.url.search + $page.url.hash}
			character={data.selectedCharacter}
		/>
	</div>
</div>

<main>
	<slot />
</main>

<footer>
	<Link href={links.changelog()}>🗒️ Changelog</Link>
	<div>
		Made by hop and hopefully some others, maybe you?
		<LinkExternal href="https://github.com/twinstar-bosskills/twinstar-bosskills">
			We are open source
		</LinkExternal>
	</div>
</footer>

<style>
	:global(:root) {
		--body-padding: 0.5rem;
		--color-fg: whitesmoke;
		--color-bg: 0, 0, 0;
		/* --color-primary: goldenrod; */
		--color-primary: 218, 165, 32;
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

		--color-class-1: #c69b6d;
		--color-class-2: #f48cba;
		--color-class-3: #aad372;
		--color-class-4: #fff468;
		--color-class-5: #ffffff;
		--color-class-6: #c41e3b;
		--color-class-7: #2359ff;
		--color-class-8: #68ccef;
		--color-class-9: #9382c9;
		--color-class-10: #00ff96;
		--color-class-11: #ff7c0a;

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

		scrollbar-color: rgba(var(--color-bg), 0.75) rgba(var(--color-primary), 1);
		/* scrollbar-width: thin; */
	}

	:global(::-webkit-scrollbar) {
		width: 0.75rem;
		height: 0.75rem;
	}

	:global(::-webkit-scrollbar-track) {
		background: rgba(var(--color-primary), 1);
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
		padding: var(--body-padding);
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
		color: rgba(var(--color-primary), 1);
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
		color: rgba(var(--color-primary), 1);
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
		grid-template-columns: 1fr max-content max-content;

		font-size: 1.25rem;

		padding-bottom: 0.5rem;
		border-bottom: 2px solid rgba(var(--color-primary), 1);
	}

	main {
		flex-grow: 1;
	}

	.select-realm {
		display: flex;
		align-items: center;
	}
	.select-character {
		padding: 0.25rem 0;
		display: flex;
		align-items: center;
	}

	:global(nav a) {
		text-decoration: none;
		color: rgba(var(--color-primary), 1);
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
	nav ul li:last-child {
		margin-right: 0;
	}

	footer {
		display: flex;
		justify-content: space-between;
		padding: 0.5rem;
		text-align: center;
		font-size: 80%;
		gap: 0.25rem;
	}

	@media (max-width: 540px) {
		.top {
			grid-template-columns: 1fr 1fr;
		}
		nav {
			justify-self: flex-end;
		}
	}
	@media (max-width: 464px) {
		footer {
			flex-direction: column;
			align-items: center;
		}
	}
	@media (max-width: 330px) {
		.top {
			grid-template-columns: 1fr;
		}
		nav ul {
			flex-direction: column;
		}
		nav {
			justify-self: auto;
		}
		nav,
		.select-character,
		.select-realm {
			justify-content: center;
		}
	}
</style>
