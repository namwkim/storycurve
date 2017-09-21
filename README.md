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
 A story curve is designed to visualize any data that involves comparison of two orders for the same set of elelemts (e.g., story order vs narrative order of same events). An example of movie data we use in the demo looks like the following:
 
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
 You can use accessor functions to use your own custom data format. For example, if you have a dataset like the following,
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
Here, we will demonstrate how we used the [_Pulp Fiction_](http://storycurve.namwkim.org/datasets/pulp_fiction.json) data to create its story curve. You can find example codes that were used in the data [here](https://github.com/namwkim/storycurve/blob/gh-pages/js/draw_storycurves.js).

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
The output of the code is the figure below. You can find the definitions of the functions used in the code above at the bottom of this [file](https://github.com/namwkim/storycurve/blob/gh-pages/js/draw_storycurves.js).


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

Sets an accessor function for children of a data point. Child elements are vertically stacked. If no _accessor_ is provided, returns the current accessor. The default accessor is as below:

```js
vis.children(d=>d.characters);
```

<a name="child" href="#child">#</a> _vis_.**child**([_accessor_])

Sets an accessor function for a child in the children list. That is, if the child object contains multiple attributes, it needs to be specified what attribute is used as a label for the child. If no _accessor_ is provided, returns the current accessor. The default accessor is as below:

```js
vis.child(child=>child);
```

<a name="band" href="#band">#</a> _vis_.**band**([_accessor_])

Sets an accessor function for a first metadata for a data point which is visualized as a surrounding band. If the categories of the metadata are too many, it is desirable to filter them in advance as they can overload the visualization. If no _accessor_ is provided, returns the current accessor. The default accessor is as below:

```js
vis.band(d=>d.scene_metadata.location);
```

<a name="backdrop" href="#backdrop">#</a> _vis_.**backdrop**([_accessor_])

Sets an accessor function for a second metadata for a data point which is visualized as a backdrop. If the categories of the metadata are too many, it is desirable to filter them in advance as they can overload the visualization. If no _accessor_ is provided, returns the current accessor. The default accessor is as below:

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


<a name="xaxisTitle" href="#xaxisTitle">#</a> _vis_.**xaxisTitle**([_accessor_])

Sets x-axis title. If a _string_ is not specified, returns the current title. The default is 'Narrative order →'':

```js
vis.xaxisTitle('Narrative order →');
```

<a name="tooltipFormat" href="#tooltipFormat">#</a> _vis_.**tooltipFormat**([_accessor_])

<a name="xs" href="#xs">#</a> _vis_.**xs**([_accessor_])

<a name="ys" href="#ys">#</a> _vis_.**ys**([_accessor_])

<a name="backdropColorScale" href="#backdropColorScale">#</a> _vis_.**backdropColorScale**([_accessor_])

<a name="bandColorScale" href="#bandColorScale">#</a> _vis_.**bandColorScale**([_accessor_])

<a name="childColorScale" href="#childColorScale">#</a> _vis_.**childColorScale**([_accessor_])

<a name="highlights" href="#highlights">#</a> _vis_.**highlights**([_accessor_])

<a name="isHighlighted" href="#isHighlighted">#</a> _vis_.**isHighlighted**([_accessor_])

<a name="width" href="#width">#</a> _vis_.**width**([_accessor_])

<a name="height" href="#height">#</a> _vis_.**height**([_accessor_])

<a name="on" href="#on">#</a> _vis_.**on**([_accessor_])
