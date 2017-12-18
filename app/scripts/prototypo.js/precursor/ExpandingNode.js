import _mapValues from 'lodash/mapValues';
import _take from 'lodash/take';
import _difference from 'lodash/difference';

import {round2D} from '../utils/linear';

import {constantOrFormula, readAngle} from '../utils/generic';

import Node from './Node';

export default class ExpandingNode extends Node {
	constructor(source, i, j) {
		super(source, i, j);
		if (source.expand) {
			this.expanding = true;
			this.expand = _mapValues(source.expand, (item, key) =>
				constantOrFormula(item, `${this.cursor}expand.${key}`),
			);
		}
		else if (source.expandedTo) {
			this.expanding = false;
			this.expandedTo = source.expandedTo.map((point, k) =>
				new Node(point, undefined, undefined, `${this.cursor}expandedTo.${k}.`),
			);
		}
	}

	readyToExpand(ops, index = ops.length - 1) {
		const cursorToLook = [
			`${this.cursor}expand.width`,
			`${this.cursor}expand.distr`,
			`${this.cursor}expand.angle`,
			`${this.cursor}x`,
			`${this.cursor}y`,
		];

		const done = _take(ops, index + 1);

		// if all the op are done we should have a length 5 short because
		// we removed the 5 necessary cursor
		return _difference(done, cursorToLook).length === done.length - cursorToLook.length;
	}

	static applyExpandChange(computedNode, changes, cursor) {
		/* eslint-disable no-param-reassign */
		computedNode.expand.baseWidth = computedNode.expand.width;
		computedNode.expand.baseDistr = computedNode.expand.distr;
		computedNode.expand.baseAngle = readAngle(computedNode.expand.angle);
		computedNode.expand.width = computedNode.expand.baseWidth * (changes[`${cursor}.expand.width`] || 1);
		computedNode.expand.angle = computedNode.expand.baseAngle + (changes[`${cursor}.expand.angle`] || 0);
		computedNode.expand.distr = computedNode.expand.baseDistr + (changes[`${cursor}.expand.distr`] || 0);
		return computedNode;
		/* eslint-disable no-param-reassign */
	}

	static expand(computedNode) {
		// TODO remove readAngle once we convert all the angle to rad in the ptf
		const {x, y, expand: {width, angle, distr}} = computedNode;

		return [
			round2D({
				x: x - (Math.cos(readAngle(angle)) * width * distr),
				y: y - (Math.sin(readAngle(angle)) * width * distr),
			}),
			round2D({
				x: x + (Math.cos(readAngle(angle)) * width * (1 - distr)),
				y: y + (Math.sin(readAngle(angle)) * width * (1 - distr)),
			}),
		];
	}
}