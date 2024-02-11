// @ts-ignore
import { prepareBoxplotData } from 'echarts/extension/dataTool';

export type PreparedData = {
	axisData: string[];
	boxData: [number, number, number, number, number][];
	outliers: [number, number][];
};
const prepareData = (values: number[][]): PreparedData => {
	return prepareBoxplotData(values, { boundIQR: 'none' });
};

export type IndexToSpecId = Record<number, number>;
export type AggregatedBySpec = Record<number, number[]>;
export type AggregatedBySpecStats = { indexToSpecId: IndexToSpecId; prepared: PreparedData };
export const aggregateBySpec = (aggregatedBySpec: AggregatedBySpec): AggregatedBySpecStats => {
	// remember which value index maps to specId
	const keys = [];
	const values = [];
	for (const [key, value] of Object.entries(aggregatedBySpec)) {
		keys.push(Number(key));
		values.push(value);
	}

	const prepared = prepareData(values);

	// add index dimension
	const boxDataWithIndex: [(typeof prepared.boxData)[0], number][] = [];
	for (let i = 0; i < prepared.boxData.length; ++i) {
		boxDataWithIndex.push([prepared.boxData[i]!, i]);
	}
	boxDataWithIndex.sort((a, b) => {
		// median
		return a[0][2] - b[0][2];
	});

	// remove index dimension and round numbers
	prepared.boxData = boxDataWithIndex.map(([d]) => {
		d[0] = Math.round(100 * d[0]) / 100;
		d[1] = Math.round(100 * d[1]) / 100;
		d[2] = Math.round(100 * d[2]) / 100;
		d[3] = Math.round(100 * d[3]) / 100;
		d[4] = Math.round(100 * d[4]) / 100;

		return d;
	});

	const indexToSpecId: IndexToSpecId = {};
	for (let i = 0; i < boxDataWithIndex.length; i++) {
		const keyIndex = boxDataWithIndex[i]![1];
		indexToSpecId[i] = keys[keyIndex]!;
	}

	return { indexToSpecId, prepared };
};
