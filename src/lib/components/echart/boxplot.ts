// @ts-ignore
import { prepareBoxplotData } from 'echarts/extension/dataTool';

export type PreparedData = {
	axisData: string[];
	boxData: [number, number, number, number, number][];
	outliers: [number, number][];
};
export const prepareData = (values: number[][]): PreparedData => {
	return prepareBoxplotData(values);
};
