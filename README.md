# Story Curve
- A technique for visualizing nonlinear narratives
- Demo: http://storycurve.namwkim.org/
- If you have any quesiton, please feel free to contact: Nam Wook Kim, namwkim85@gmail.com

![Story Explorer](http://storycurve.namwkim.org/img/storycurve_examples.png)


### Story Explorer
Story explorer is a system built using story curves to visually explore narrative structures of popular nonlinear films like Memento and Pulp Fiction. [Try it](storyexplorer.namwkim.org).
  
### Install
**Dependencies**
- [d3](https://d3js.org/) and [d3-tip](https://github.com/Caged/d3-tip)

- Include [`storycurve.css`](https://github.com/namwkim/storycurve/blob/master/dist/storycurve.css) and [`storycurve.js`](https://github.com/namwkim/storycurve/blob/master/dist/storycurve.js) in the [`dist`](https://github.com/namwkim/storycurve/tree/master/dist) folder

```
<link rel="stylesheet" type="text/css" href="https://raw.githubusercontent.com/namwkim/storycurve/master/dist/storycurve.css">
<script src="https://raw.githubusercontent.com/namwkim/storycurve/master/dist/storycurve.js"></script>
```

- Or, install using `npm`
```
npm install storycurve --save
```
### Data
 A story curve is designed to visualize any data that involves comparison of two orders for the same set of elelemts (e.g., story order vs narrative order of same events). An example of movie data we use in the demo is below:
 
 ```javascript
 {
  "movie_info": {
  ...
  },
  "script_info":{
    "scenes":[
      {
        "narrative_order":0,
        "story_order": 29,
        "scene_metadata":{
          "size":6288,
          "location": "Coffee Shop",
          "time":"Morning",
          ...
        },
        "characters":[
          "Young Man",
          "Young Woman",
          ...
        ]
        ...
      }
    ]
  }
 }
 ```
 You can take a look at the [_Pulp Fiction_](http://storycurve.namwkim.org/datasets/pulp_fiction.json) data using [online json viewer](http://jsoneditoronline.org/).
 
 #### Using Custom Data Format
 You can use accessor functions in order to use your own custom data format. For example, if you have a dataset like the following,
 ```javascript
 [
  {
    x:0,
    y:29,
    size:6288,
    metadata1:"Coffee Shop",
    metadata2:"Morning",
    children:[
      "Young Man",
      "Young Woman"
    ]
  }
  ... 
 ]
 ```
 and using accessors as below, the story curve will be able to find appropriate data attributes to visualize.
 ```javascript
  var vis = new storycurve('#pulp_fiction');
  vis.x(d=>d.x)
    .y(d=>d.y)
    .size(d=>d.size)
    .band(d=>d.metadata1)
    .backdrop(d=>d.metadata2)
    .children(d=>d.children);
    
 ```

### How to Use
Here, we will demonstrate how we used the [_Pulp Fiction_](http://storycurve.namwkim.org/datasets/pulp_fiction.json) data to create its story curve. You can find more example codes that were used in the demo: [here](https://github.com/namwkim/storycurve/blob/gh-pages/js/draw_storycurves.js).

```html
<div id="pulp_fiction" class="storycurve"></div>
```

```javascript
fetch('datasets/pulp_fiction_simple.json').then(function(response){
  response.json().then(function(data){
  
    var vis = new storycurve('#pulp_fiction');
    
    // ranking and extracting top elements
    var characters = rankCharacterByVerbosity(data.script_info, 8);
    var locations = rankMetadataBySceneSize(data.script_info, 'location', 4);
    var times = rankMetadataBySceneSize(data.script_info, 'time', 2);
    
    // set domain for color scale, otherwise story curve will display all not just top ones.
    vis.bandColorScale().domain(locations);
    vis.backdropColorScale().domain(times);
    vis.childColorScale().domain(characters);
      
    // use a custom format and setting display options
    vis.tooltipFormat(tooltipFormat.bind(vis))
          .showBackdrop(true)
          .showBand(true)
          .showChildren(true)
          .zoomEnabled(false)
          .draw(data.script_info.scenes);
  }
}
```
The output of the code is the figure below. You can find the definitions of the functions (e.g., rankCharacterByVerbosity) used in the code above at the bottom of this [file](https://github.com/namwkim/storycurve/blob/gh-pages/js/draw_storycurves.js).


![Pulp Fiction code outcome](http://storycurve.namwkim.org/img/pulp_fiction.png)

### API Reference

<a name="x" href="#x">#</a> _vis_.**x**([_accessor_])

Sets an accessor function for the horizontal position of a data point. If no _accessor_ is provided, returns the current accessor. The default accessor is as below:

```js
vis.x(d=>d.narrative_order);
```

<a name="y" href="#y">#</a> _vis_.**y**([_accessor_])

Sets an accessor function for the vertical position of a data point. If no accessor is provided, returns the current accessor. The default accessor is as below:

```js
vis.x(d=>d.story_order);
```

<a name="size" href="#size">#</a> _vis_.**size**([_accessor_])

Sets an accessor function for the size of a data point. If no accessor is provided, returns the current _accessor_. The default accessor is as below:

```js
vis.size(d=>d.scene_metadata.size);
```


<a name="children" href="#children">#</a> _vis_.**children**([_accessor_])

Sets an accessor function for children of a data point. Child elements are vertically stacked with different colors. If no _accessor_ is provided, returns the current accessor. The default accessor is as below:

```js
vis.children(d=>d.characters);
```

<a name="child" href="#child">#</a> _vis_.**child**([_accessor_])

Sets an accessor function for a child in the children list. That is, if the child object contains multiple attributes, it needs to be specified what attribute is used as a label for the child. If no _accessor_ is provided, returns the current accessor. The default accessor is as below:

```js
vis.child(child=>child);
```

<a name="band" href="#band">#</a> _vis_.**band**([_accessor_])

Sets an accessor function for a metadata for a data point which is visualized as a surrounding band. If the categories of the metadata are too many, it is desirable to filter them in advance as they can overload the visualization. If no _accessor_ is provided, returns the current accessor. The default accessor is as below:

```js
vis.band(d=>d.scene_metadata.location);
```

<a name="backdrop" href="#backdrop">#</a> _vis_.**backdrop**([_accessor_])

Sets an accessor function for a metadata for a data point which is visualized as a backdrop. If the categories of the metadata are too many, it is desirable to filter them in advance as they can overload the visualization. If no _accessor_ is provided, returns the current accessor. The default accessor is as below:

```js
vis.band(d=>d.scene_metadata.time);
```

<a name="showBand" href="#showBand">#</a> _vis_.**showBand**([_boolean_])

Determins whether to show bands or not. If a _boolean_ is not specified, returns the current setting. The default is false:

```js
vis.showBand(false);
```

<a name="showBackdrop" href="#showBackdrop">#</a> _vis_.**showBackdrop**([_boolean_])

Determins whether to show backdrops or not. If a _boolean_ is not specified, returns the current setting. The default is false:

```js
vis.showBackdrop(false);
```

<a name="showChildren" href="#showChildren">#</a> _vis_.**showChildren**([_boolean_])

Determins whether to show children or not. If not true, shows a single visual mark per column. If a _boolean_ is not specified, returns the current setting. The default is false:

```js
vis.showChildren(false);
```

<a name="zoomEnabled" href="#zoomEnabled">#</a> _vis_.**zoomEnabled**([_boolean_])

Sets whether to enable zooming and panning. If a _boolean_ is not specified, returns the current setting. The default is true:

```js
vis.zoomEnabled(true);
```

<a name="yaxisTitle" href="#yaxisTitle">#</a> _vis_.**yaxisTitle**([_string_])

Sets y-axis title. If a _string_ is not specified, returns the current title. The default is '← Story order'':

```js
vis.yaxisTitle('← Story order');
```


<a name="xaxisTitle" href="#xaxisTitle">#</a> _vis_.**xaxisTitle**([_string_])

Sets x-axis title. If a _string_ is not specified, returns the current title. The default is 'Narrative order →'':

```js
vis.xaxisTitle('Narrative order →');
```

<a name="tooltipFormat" href="#tooltipFormat">#</a> _vis_.**tooltipFormat**([_format_])

Sets the format of the tooptip. A data point corresponding to the mouse location is supplied to the callback. The default is just printing x and y orders:

```js
vis.tooltipFormat(d=>{
  let content = '<table>';
  content += ('<tr><td><span style="color:#FBBD08">(X,Y)</span></td><td>&nbsp; ' + d.xo + ', ' + d.yo + '</td></tr>');
  content += '</table>';
  return content;
});
```

The tooltip formatting function used in the demo is below:

```js
function tooltipFormat(d){
  var childColor = this.childColorScale();

  var scene = d.orgData;

  var content = '<p>';
  content += '<strong style="color:#757575">N, S = ' + d.xo + ', ' + d.yo + '</strong><br>';

  scene.characters.map(function(c){
    content += ('<strong style="color:'+ childColor(c)+'">'+c+'</strong><br>');
  });
  var loc = scene.scene_metadata.location;
  if (loc){
    content += ('<strong style="color:#9E9E9E">'+loc+'</strong><br>');
  }

  var time = scene.scene_metadata.time;
  if (time){
    content += ('<strong style="color:#9E9E9E">'+time+'</strong><br>');
  }
  content += '</p>';

  return content;
```


<a name="bandColorScale" href="#bandColorScale">#</a> _vis_.**bandColorScale**([_categorical_scale_])

Sets and gets the color scale for band categorical metadata. It is [a categorical color scale](https://github.com/d3/d3-scale#ordinal-scales). The default palette is ['#eedaf1','#fad1df','#cfe8fc','#daddf1'], which means you need to set the domain for the 4 colors if [_showBand_](#showBand) is set _true_. You need to filter data beforehand by setting unused categories to null (e.g., setting all but top 4 to null). Otherwise, unknown category is assigned no color (transparent). 

```js
var locations = rankMetadataBySceneSize(data.script_info, 'location', 4); //get top 4 locations
vis.backdropColorScale.domain(locations);
```

If you want to support more than 4 cateogories, you change the range of the scale:

```js
var locations = rankMetadataBySceneSize(data.script_info, 'location', 5); //get top 5 locations
vis.backdropColorScale.domain(locations);
vis.backdropColorScale().range(['#d7191c', '#fdae61', '#ffffbf', '#abd9e9', '#2c7bb6']);
```

<a name="backdropColorScale" href="#backdropColorScale">#</a> _vis_.**backdropColorScale**([_categorical_scale_])

Sets and gets the color scale for backdrop categorical metadata. It is [a categorical color scale](https://github.com/d3/d3-scale#ordinal-scales). The default palette is ['#CFD8DC', '#90A4AE', '#607D8B'], which means you need to set the domain for the 8 colors if [_showBackdrop_](#showBackdrop) is set _true_. You need to filter data beforehand by setting unused categories to null (e.g., setting all but top 3 to null). Otherwise, unknown category is assigned no color (transparent).  You can modify the scale as you want by changing the domain and range of the scale similar to [_bandColorScale_](#bandColorScale).


<a name="childColorScale" href="#childColorScale">#</a> _vis_.**childColorScale**([_categorical_scale_])

Similar to other color scales, it allows you to modify the color scale of children. The default is ['#db2828','#f2711c','#fbbd08','#b5cc18','#21ba45','#00b5ad','#2185d0','#6435c9'] which means you need to set the domain for the 8 colors if [_showChildren_](#showChildren) is set _true_. You need to filter data beforehand by setting them to null (e.g., setting all but top 8 to null). Otherwise, unknown category is assigned _'#9E9E9E'_. You can modify the scale as you want by changing the domain and range of the scale similar to [_bandColorScale_](#bandColorScale).


<a name="highlights" href="#highlights">#</a> _vis_.**highlights**([_highlights_])

Immediately highlights the elements specified. It is used with [_isHighlighted_](#isHighlighted), which checks if a data point needs to be highlighted. This is used in Story Explorer, when a user selectively highlights characters or locations, etc. An example of the input can be as below:
```js
vis.highlights([
  {
    type:'child',
    filter:'Jules'
    
  },
  {
    type: 'band',
    filter: 'Morning'
   }
])
```
This filters a child named 'Jules' and a band named 'Morning'. You need to set an appropriate function for [_isHighlighted_](#isHighlighted) as well.

<a name="isHighlighted" href="#isHighlighted">#</a> _vis_.**isHighlighted**([_checker_])

It is used in conjuntion with [_highlights_](#highlights). _checker_ receives three arguments _target_, _d_, _highlights_:
```js
let highlightAll = function(target, d, highlights){
  return target.data==null?false:(highlights.length==0? true:
    highlights.some(h=>target.data==h.filter));
}
```
The above function highlights all visual marks that match _highlights_. _checker_ is called for each child, band, and backdrop. _target_ contains _type_ to indicate the caller, i.e., 'child', 'band' or 'backdrop'. It also contains _data_ that contains a corresponding value, e.g., 'Jules'. _highlights_ is the input you specify in [_highlights_](#highlights).

For your information, the definition of [_highlights_](#highlights) is below:

```js
highlights(_) {
  if (!arguments.length) return this._highlights;
  this._highlights = _;

  //highlight marks
  this.container.selectAll('.scene-group')
    .select('.band')
    .style('fill-opacity',
      d => this._isHighlighted({
          type: 'band',
          data: this._band(d.orgData)
        },
        d.orgData, this._highlights) ? 1.0 : 0.0);

  this.container.selectAll('.scene-group')
    .select('.backdrop')
    .style('fill-opacity',
      d => this._isHighlighted({
          type: 'backdrop',
          data: this._backdrop(d.orgData)
        },
        d.orgData, this._highlights) ? 0.25 : 0.0);

  this.container.selectAll('.scene-group')
    .select('.children')
    .selectAll('.mark')
    .style('fill-opacity',
      d => this._isHighlighted({
          type: 'child',
          data: d.orgData
        },
        d.parentOrgDdata, this._highlights) ? 1.0 : 0.05);

  return this;
}
```
This function will immediately highlight _highlights_, meaning that [_draw_](#draw) does not need to be called.


You can use the following function to highlight co-occurrence. 

```js
let highlightCooccur = function(target, d, highlights){
  return target.data==null?false:(highlights.length==0? true:
    highlights.every(h=>
      h.type=='characters'?d[h.type].includes(h.filter):
        d.scene_metadata[h.type]==h.filter));
};
```

For a use case, please refer to the code of Story Explorer ([link](https://github.com/namwkim/storyexplorer/blob/master/frontend/src/modules/vis/index.js)).

<a name="width" href="#width">#</a> _vis_.**width**([_accessor_])

Sets or gets the width of the visualization. When a new width is set, [_draw_](#draw) needs to be called again.

<a name="height" href="#height">#</a> _vis_.**height**([_accessor_])

Sets or gets the height of the visualization. When a new height is set, [_draw_](#draw) needs to be called again.

<a name="draw" href="#draw">#</a> _vis_.**draw**([_data_])

Draw or update a story curve with _data_. If any settings are updated, this function needs to be called with the same data.


<a name="on" href="#on">#</a> _vis_.**on**([_name_, _listener_])

Sets or gets a listner for events occurring on the story curve. Supported events include 'zoom', 'mouseover', 'mouseout', 'click' (i.e., _name_ argument). _listener_ for 'mouseover', 'mouseout', and 'click' events takes _data_, _index_, _nodes_ as arguments, while 'zoom' receives _transform_ so that you can coordinate with other visualizations.

```js
let onZoom = function(transform){
  othervis.forEach(vis=>vis.transform('transform', transform));
};
vis.on('zoom', onZoom);
```
<a name="transform" href="#transform">#</a> _vis_.**transform**([_op_, _param_])

Reveals transform functions in [d3-zoom](https://github.com/d3/d3-zoom). _op_ can be any method of d3.zoom() such as '_scaleBy_' or '_translateBy_' and _param_ is the parameters of the operator. For example, if you want to manually scale a story curve with a zoom factor 1.2:

```js
vis.transform('scaleBy', 1.2);
```

