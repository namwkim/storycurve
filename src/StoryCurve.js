import './storycurve.css';
import {select, event} from 'd3-selection';
import {line} from 'd3-shape';
import {max, sum} from 'd3-array';
import {axisTop, axisLeft} from 'd3-axis';
import {scaleLinear, scaleOrdinal} from 'd3-scale';
import {zoom, zoomTransform} from 'd3-zoom';
import 'd3-tip'; //TODO: remove this dependency?

// mouse events
const ONZOOM = 'zoom';
const ONMOUSECLICK = 'click';
const ONMOUSEOVER = 'mouseover';
const ONMOUSEOUT = 'mouseout';


// private functions
let helper = {
	axisStyleUpdate: function(selection) {
		let xaxisContainer = selection.select('.x.axis');
		xaxisContainer.select('.domain')
			.classed('axis-domain', true);
		xaxisContainer.selectAll('.tick line')
			.classed('xaxis-tick-line', true);
		xaxisContainer.selectAll('.tick text')
			.classed('axis-text', true);

		let yaxisContainer = selection.select('.y.axis');
		yaxisContainer.select('.domain')
			.classed('axis-domain', true);
		yaxisContainer.selectAll('.tick line')
			.classed('yaxis-inner-tick', true);
		yaxisContainer.selectAll('.tick text')
			.classed('axis-text', true)
			.attr('dy', -4);
	}
};

export default class StoryCurve {

	constructor(selector) {
		this._container = selector ? select(selector) : null;
		this._width = 800;
		this._height = 300;
		this._margin = {
			top: 0,
			left: 0,
			right: 0,
			bottom: 10
		};
		this._duration = 400; // animation duration
		this._zoom = zoom();

		this._xs = scaleLinear(); //x-scale
		this._ys = scaleLinear(); //y-scale

		this._cs = scaleOrdinal() //color scale for children
			.range(['#00B5AD']);

		this._csm1 = scaleOrdinal()//color scale for metadata1
			.range(['#f2711c']);
		this._csm2 = scaleOrdinal() //color scale for metadata2
			.range(['#a333c8']);

		this._xaxis = axisTop();
		this._yaxis = axisLeft();
		this._xtitle = 'Narrative order →';
		this._ytitle = '← Story order';

		this._palette = ['#00B5AD'];

		this._listners = new Map();//event listeners

		this._highlights = []; //columns to highlight

		//TODO: remove dependency on d3.tip
		this._tip = d3.tip()
			.attr('class', 'd3-tip')
			.offset([0, 10])
			.direction('e')
			.html(this._tipFormat);
	}
	draw(data) {
		if (this._container.empty()) {
			return;
		}

		this._container.datum(data);

		// console.log('---------- StoryCurve ----------');
		let width = this._width - this._margin.left - this._margin.right;
		let height = this._height - this._margin.top - this._margin.bottom;
		let xpadding = 80; // horz-space for y-axis labels
		let ypadding = 40; // vert-space for x-axis labels
		let markHeight = 8; // variable width, fixed height

		// create root container
		let svg = this._container.select('svg');
		if (svg.empty()) { // init
			svg = this._container.append('svg');
			svg.append('g')
				.attr('class', 'visarea')
				.append('defs')
				.append('clipPath')
				.attr('id', 'clipID' + Date.now())//unique clippath
				.append('rect')
				.attr('x', xpadding)
				.attr('y', ypadding);

			svg.call(this._tip);

		}
		let g = svg.select('.visarea');
		// update vis size
		svg.attr('width', this._width)
			.attr('height', this._height);
		g.attr('transform',
			'translate(' + this._margin.left + ',' + this._margin.top + ')');

		//clip path for zomming
		g.select('clipPath').select('rect')
			.attr('width', width - xpadding)
			.attr('height', height - ypadding + markHeight);

		// let tooltip = select(this).select('.tooltip');
		// if (tooltip.empty()) {
		// 	this.createTooltip(select(this)); //replace with tip
		// }

		// define scales
		this._xs.domain([0, sum(data, this._size)])
			.range([xpadding, width]);

		this._ys.domain([0, max(data, this._yOrder)])
			.range([ypadding, height - markHeight]);

		// let categories = set(data.reduce((acc, d)=>
		// 	acc.concat(this._children(d).map(
		// 		c=>this._childCategory(c))),[])).values();
		// // console.log(categories);
		// this._cs.domain(categories.sort())
		// 	.range(this._palette);

		// compute story curve layout
		let cursor = 0;
		let markData = data.sort((d1, d2) => {// sort by x-order
			return this._xOrder(d1) - this._xOrder(d2);
		}).map(d => {
			let x0 = this._xs(cursor);
			cursor += this._size(d); //move cursor by width (e.g., scene length)
			let x1 = this._xs(cursor);//width = x1 - x0
			let y = this._ys(this._yOrder(d));

			// children layout in each scene
			let children = this._children(d).map((c, i) => {
				return {
					orgData: c, //child data
					parentOrgDdata: d, //parent data
					x0: x0,
					x1: x1,
					y: y + i * markHeight //vertically stacked
				};
			});
			return {
				orgData: d,
				children: children,
				x0: x0,
				x1: x1,
				y: y,
				id: this._xOrder(d),//unique id (no duplicate order allowed)
				xo: this._xOrder(d),
				yo: this._yOrder(d)
			};
		});

		// construct axes
		let xaxisContainer = g.select('.x.axis');
		if (xaxisContainer.empty()) {
			xaxisContainer = g.append('g')
				.attr('class', 'x axis')
				.attr('transform', 'translate(0,' + ypadding + ')');
		}

		this._xaxis.scale(this._xs);
		xaxisContainer.call(this._xaxis);

		let yaxisContainer = g.select('.y.axis');
		if (yaxisContainer.empty()) {
			yaxisContainer = g.append('g')
				.attr('class', 'y axis')
				.attr('transform', 'translate(' + xpadding + ',0)');
		}

		let ydivide = Math.round(max(markData.map(d => d.yo)) / 3);

		this._yaxis.scale(this._ys)
			.tickValues([ydivide, 2 * ydivide, 3 * ydivide])
			.tickSizeInner(-(width - xpadding))
			.tickSizeOuter(0);
		yaxisContainer.call(this._yaxis);

		helper.axisStyleUpdate(this._container);//TODO

		// draw axis labels
		if (g.select('.bg-line').empty()) {
			g.append('line')
				.attr('class', 'bg-line')
				.attr('x1', 0)
				.attr('x2', xpadding)
				.attr('y1', ypadding)
				.attr('y2', ypadding);
		}

		let axisTitles = g.selectAll('.axis-legend')
			.data([
				[width, 0, 0, this._xtitle, 'end'],
				[0, height - 10, -90, this._ytitle, 'start']
			]);
		axisTitles.enter()
			.append('text')
			.attr('class', 'axis-legend')
			.merge(axisTitles)
			.text(d => d[3])
			.attr('text-anchor', d => d[4])
			.attr('transform',
				d => 'translate(' + (d[0]) + ',' + (d[1]) + ')rotate(' + (d[2]) + ')');

		// draw background
		let bandSize = this._ys(ydivide) - ypadding;
		let bgdata = [
			[0, 'Beginning'],
			[bandSize, 'Middle'],
			[2 * bandSize, 'End']
		];

		let bgpanels = g.selectAll('.bgpanel')
			.data(bgdata);

		let bgpanelEnter = bgpanels.enter()
			.append('g')
			.attr('class', 'bgpanel');

		bgpanelEnter.append('text')
			.text(d => d[1])
			.attr('class', 'bg-text')
			.merge(bgpanels.select('text'))
			.attr('transform',
				d => 'translate(' + (xpadding / 2) + ',' + (ypadding + d[0] + bandSize / 2.0) + ')');

		bgpanelEnter.append('line')
			.attr('class', 'bg-line')
			.merge(bgpanels.select('line'))
			.attr('stroke-dasharray', '3,3')
			.attr('x1', 20)
			.attr('x2', xpadding)
			.attr('y1', d => ypadding + d[0] + bandSize)
			.attr('y2', d => ypadding + d[0] + bandSize);

		// main group containing marks (to be zoomed and panned)
		let main = g.select('.main');
		if (main.empty()) {
			main = g.append('g')
				.attr('clip-path', 'url(#' + g.select('clipPath').attr('id') + ')')
				.append('g')
				.attr('class', 'main');
		}

		// draw line connecting marks
		let lineData = markData.reduce((l, d) => {
			l.push([d.x0, d.y]);
			l.push([d.x1, d.y]);
			return l;
		}, []);

		let path = line()
			.x(d => d[0])
			.y(d => d[1]);

		let linePath = main.select('.connect-line');
		if (linePath.empty()) {
			linePath = main.append('path')
				.attr('class', 'connect-line');
				// .attr('stroke', 'url(#svgGradient)');
		}
		linePath.datum(lineData)
			.attr('d', path);

		// draw rect marks
		let sceneUpdate = main.selectAll('.scene-group')
			.data(markData, d => d.id);

		sceneUpdate.exit().remove();


		let sceneEnter = sceneUpdate.enter()
			.append('g')
			.attr('class', 'scene-group');

		sceneEnter.append('rect')
			.attr('class', 'overlay')
			.on(ONMOUSEOVER, (d, i, ns) => this._onMouseOver(d, i, ns))
			.on(ONMOUSEOUT, (d, i, ns) => this._onMouseOut(d, i, ns))
			.on(ONMOUSECLICK, (d, i, ns) => this._onMouseClick(d, i, ns));

		sceneEnter.append('rect')
			.attr('class', 'overlay-horz');

		sceneEnter.append('rect')
			.attr('pointer-events', 'none')
			.attr('class', 'long-band');

		sceneEnter.append('rect')
			.attr('pointer-events', 'none')
			.attr('class', 'short-band');

		// multiple children
		sceneEnter.append('g')
			.attr('class', 'children');

		sceneUpdate = sceneEnter.merge(sceneUpdate);

		sceneUpdate.select('.overlay')
			.attr('x', d => d.x0)
			.attr('y', ypadding)
			.attr('height', height - ypadding - markHeight)
			.attr('width', d => d.x1 - d.x0);

		sceneUpdate.select('.overlay-horz')
			.attr('x', xpadding)
			.attr('y', d => d.y)
			.attr('height', markHeight)
			.attr('width', width);

		sceneUpdate.select('.short-band')
			.attr('x', d => d.x0)
			.style('fill-opacity',
				d => this._isHighlighted({
						type: 'metadata1',
						data: this._metadata1(d.orgData)
					},
					d.orgData, this._highlights) ? 1.0 : 0.0)
			.style('fill', d =>this._csm1(this._metadata1(d.orgData)))//d =>
			.attr('y', d => d.y)
			.attr('width', 0)
			.attr('height', 0)
			.transition()
			.attr('y', d => d.y - 5 * markHeight)
			.duration(this._duration)
			.attr('width', d => d.x1 - d.x0)
			.attr('height', markHeight * 11); //d=>markHeight*(this._children(d.orgData).length+10))

		sceneUpdate.select('.long-band')
			.attr('x', d => d.x0)
			.attr('y', ypadding)
			.attr('width', d => d.x1 - d.x0)
			.style('fill', d => this._csm2(this._metadata2(d.orgData)))
			.style('fill-opacity',
				d => this._isHighlighted({
						type: 'metadata2',
						data: this._metadata2(d.orgData)
					},
					d.orgData, this._highlights) ? 0.25 : 0.0)
			.attr('height', 0)
			.transition()
			.duration(this._duration)
			.attr('height', height - ypadding - markHeight);


		let children = sceneUpdate.select('.children').selectAll('.mark')
			.data(d => d.children);

		children.exit().remove();

		children.enter().append('rect')
			.attr('class', 'mark')
			.attr('pointer-events', 'none')
			.attr('x', d => d.x0)
			.attr('y', d => d.y)
			.merge(children)
			.transition()
			.duration(this._duration)
			.style('fill-opacity',
				d => this._isHighlighted({
						type: 'children',
						data: d.orgData
					},
					d.parentOrgDdata, this._highlights) ? 1.0 : 0.15)
			.attr('fill', d => this._cs(this._childCategory(d.orgData, d.parentOrgDdata)))
			.attr('x', d => d.x0)
			.attr('y', d => d.y)
			.attr('width', d => d.x1 - d.x0)
			.attr('height', markHeight)
			.attr('y', d => d.y);

		// zoom setting
		g.call(this._zoom); //attach zoom to the vis area

		this._zoom.extent([
				[xpadding, 0],
				[width, height]
			])
			.translateExtent([
				[xpadding, 0],
				[width, height]
			])
			.scaleExtent([1, 15]);

		this._zoom.on('zoom', () => this._onZoom());

	}
	_children(d, i) {
		return ['scene-' + i];
	}
	_childCategory(d) {
		return d;
	}
	_metadata1(d) {
		return d.scene_metadata.location;
	}
	_metadata2(d) {
		return d.scene_metadata.time;
	}
	_xOrder(d) {
		return d.narrative_order;
	}
	_yOrder(d) {
		return d.story_order;
	}
	_size(d) {
		return d.scene_metadata.size;
	}
	_onZoom() {
		this._transformVis(event.transform);
		if (this._listners[ONZOOM]) {
			this._listners[ONZOOM].call(this, event.transform);
		}
	}

	_transformVis(transform) {
		this._tip.hide();
		this._container.select('.x.axis')
			.call(this._xaxis.scale(transform.rescaleX(this._xs)));

		this._container.select('.main')
			.attr('transform',
				'translate(' + transform.x + ',0)scale(' + transform.k + ',1)');

		helper.axisStyleUpdate(this._container);
	}

	transform(op, param) { // does not call callback
		this._zoom.on('zoom', null);
		//update zoom state
		let zoomContainer = this._container.select('.visarea');
		this._container.select('.visarea')
			.call(this._zoom[op], param);
		// update vis
		let transform = zoomTransform(zoomContainer.node());
		this._transformVis(transform);
		this._zoom.on('zoom', () => this._onZoom());
		return this;
	}
	_onMouseClick() {
		if (this._listners[ONMOUSECLICK]) {
			this._listners[ONMOUSECLICK].apply(this, arguments);
		}
	}
	_onMouseOver() {
		this.highlightOn(arguments[0].xo);

		if (this._listners[ONMOUSEOVER]) {
			this._listners[ONMOUSEOVER].apply(this, arguments);
		}
	}
	_onMouseOut() {
		this.highlightOff(arguments[0].xo);

		if (this._listners[ONMOUSEOUT]) {
			this._listners[ONMOUSEOUT].apply(this, arguments);
		}
	}
	_tipFormat(d) {
		let content = '<table>';
		content += ('<tr><td><span style="color:#FBBD08">(X,Y)</span></td><td>&nbsp; ' + d.xo + ', ' + d.yo + '</td></tr>');
		// content += ('<tr><td><span style="color:#767676">S.order</span></td><td>&nbsp; ' + d.so + '</td></tr>');
		content += '</table>';
		return content;
	}
	highlightOn(xo) {
		let g = this._container.selectAll('.scene-group')
			.filter((d) => d.xo == xo)
			.raise();

		g.select('.overlay')
			.style('fill-opacity', 0.2);
		g.select('.overlay-horz')
			.style('fill-opacity', 0.2);
		g.select('.short-band')
			.each((d, i, ns) => this._tip.show(d, ns[i]));


		g.selectAll('.mark')
			.classed('highlight', true);

		// if (!this._highlights){
		// 	return;
		// }
		// // retrieve all children
		// let coappear = this._container.selectAll('.scene-group')
		// 	.filter((d) => this._isHighlighted(d.scene, this._highlights));
		//
		// coappear.select('.'+css.mark)
		// 	.classed(css.coappeared, true);
	}
	highlightOff(xo) {
		let g = this._container.selectAll('.scene-group')
			.filter((d) => d.xo == xo)
			.raise();
		g.select('.overlay')
			.style('fill-opacity', 0.0);
		g.select('.overlay-horz')
			.style('fill-opacity', 0.0);
		g.select('.short-band')
			.each((d, i, ns) => this._tip.hide(d, ns[i]));
		g.selectAll('.mark')
			.classed('highlight', false);
	}
	_isHighlighted(target, d, highlights) {
		return target.data==null?false:(highlights.length==0? true:
			highlights.every(h=>
				h.type=='children'?d[h.type].includes(h.filter):
					d.scene_metadata[h.type]==h.filter));
	}

	highlights(_) {
		if (!arguments.length) return this._highlights;
		this._highlights = _;

		//highlight marks
		this._container.selectAll('.scene-group')
			.select('.short-band')
			.style('fill-opacity',
				d => this._isHighlighted({
						type: 'metadata1',
						data: this._metadata1(d.orgData)
					},
					d.orgData, this._highlights) ? 1.0 : 0.0);

		this._container.selectAll('.scene-group')
			.select('.long-band')
			.style('fill-opacity',
				d => this._isHighlighted({
						type: 'metadata2',
						data: this._metadata2(d.orgData)
					},
					d.orgData, this._highlights) ? 0.25 : 0.0);

		this._container.selectAll('.scene-group')
			.select('.children')
			.selectAll('.mark')
			.style('fill-opacity',
				d => this._isHighlighted({
						type: 'children',
						data: d.orgData
					},
					d.parentOrgDdata, this._highlights) ? 1.0 : 0.15);

		return this;
	}
	isHighlighted(_) {
		if (!arguments.length) return this._isHighlighted;
		this._isHighlighted = _;
		return this;
	}
	tipFormat(_) {
		if (!arguments.length) return this._tipFormat;
		this._tipFormat = _;
		return this;
	}
	xtitle(_) {
		if (!arguments.length) return this._xtitle;
		this._xtitle = _;
		return this;
	}
	ytitle(_) {
		if (!arguments.length) return this._ytitle;
		this._ytitle = _;
		return this;
	}
	children(_) {
		if (!arguments.length) return this._children;
		this._children = _;
		return this;
	}
	childCategory(_) {
		if (!arguments.length) return this._childCategory;
		this._childCategory = _;
		return this;
	}
	categoryScale(_) {
		if (!arguments.length) return this._cs;
		this._cs = _;
		return this;
	}
	meta1ColorScale(_) {
		if (!arguments.length) return this._csm1;
		this._csm1 = _;
		return this;
	}
	meta2ColorScale(_) {
		if (!arguments.length) return this._csm2;
		this._csm2 = _;
		return this;
	}
	metadata1(_) {
		if (!arguments.length) return this._metadata1;
		this._metadata1 = _;
		return this;
	}
	metadata2(_) {
		if (!arguments.length) return this._metadata2;
		this._metadata2 = _;
		return this;
	}
	xOrder(_) {
		if (!arguments.length) return this._xOrder;
		this._xOrder = _;
		return this;
	}
	yOrder(_) {
		if (!arguments.length) return this._yOrder;
		this._yOrder = _;
		return this;
	}
	width(_) {
		if (!arguments.length) return this._width;
		this._width = _;
		return this;
	}
	height(_) {
		if (!arguments.length) return this._height;
		this._height = _;
		return this;
	}
	size(_) {
		if (!arguments.length) return this._size;
		this._size = _;
		return this;
	}
	container(selector) {
		if (!arguments.length) return this._container;
		this._container = select(selector);
		return this;
	}
	on(name, callback) {
		this._listners[name] = callback;
		return this;
	}
}
