<nav>
	<ul>
		<li>
			<a href="/">Home</a>
		</li>
		<li>
			<a href="/characters">Characters</a>
		</li>
	</ul>
</nav>

<main>
	<slot />
</main>

<style>
	nav ul {
		margin: 0;
		padding: 0;
		display: flex;
	}
	nav ul li {
		margin: 0;
		margin-right: 0.5rem;
		padding: 0;
		text-indent: 0;
		list-style-type: none;
	}
</style>
