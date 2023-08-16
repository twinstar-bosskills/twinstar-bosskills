<script lang="ts">
	import { quadtree } from 'd3-quadtree';
	import type { LayerCake } from 'layercake';
	import { getContext } from 'svelte';

	const { data, xGet, yGet, width, height } = getContext<LayerCake>('LayerCake');

	let visible = false;
	let found: any = {};
	let e = {};

	/** @type {String} [x='x'] - The dimension to search across when moving the mouse left and right. */
	export let x = 'x';

	/** @type {String} [y='y'] - The dimension to search across when moving the mouse up and down. */
	export let y = 'y';

	/** @type {Number} [searchRadius] - The number of pixels to search around the mouse's location. This is the third argument passed to [`quadtree.find`](https://github.com/d3/d3-quadtree#quadtree_find) and by default a value of `undefined` means an unlimited range. */
	export let searchRadius: number | undefined = undefined;

	/** @type {Array} [dataset] - The dataset to work off of—defaults to $data if left unset. You can pass something custom in here in case you don't want to use the main data or it's in a strange format. */
	export let dataset: unknown[] | undefined = undefined;

	$: xGetter = x === 'x' ? $xGet : $yGet;
	$: yGetter = y === 'y' ? $yGet : $xGet;

	function findItem(evt: any) {
		e = evt;

		const xLayerKey = `layer${x.toUpperCase()}`;
		const yLayerKey = `layer${y.toUpperCase()}`;

		const xLayerVal = (evt[xLayerKey] / (x === 'x' ? $width : $height)) * 100;
		const yLayerVal = (evt[yLayerKey] / (y === 'y' ? $height : $width)) * 100;

		found = finder.find(xLayerVal, yLayerVal, searchRadius) || {};

		visible = Object.keys(found).length > 0;
	}

	$: finder = quadtree()
		.extent([
			[-1, -1],
			[$width + 1, $height + 1]
		])
		.x(xGetter)
		.y(yGetter)
		.addAll(dataset || $data);
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class="bg"
	on:mousemove={findItem}
	on:mouseout={() => (visible = false)}
	on:blur={() => (visible = false)}
/>
<slot x={xGetter(found) || 0} y={yGetter(found) || 0} {found} {visible} {e} />

<style>
	.bg {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
	}
</style>
