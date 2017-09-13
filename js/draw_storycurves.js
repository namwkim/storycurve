
vismap = {}
window.onload=function(){
  $().prettyEmbed({ useFitVids: true });
  // pulp fiction
  fetch('datasets/pulp_fiction_simple.json').then(function(response){
    response.json().then(function(data){
      // console.log('Pulp Fiction', data.script_info.scenes);

      let vis = new storycurve('#pulp_fiction');
      vismap['pulp_fiction'] = {id:'pulp_fiction', vis:vis, data:data};

      let characters = rankCharacterByVerbosity(data.script_info, 8);
      let locations = rankMetadataBySceneSize(data.script_info, 'location', 4);
      let times = rankMetadataBySceneSize(data.script_info, 'time', 2);

      vis.bandColorScale().domain(locations);
      vis.backdropColorScale().domain(times);
      vis.childColorScale().domain(characters);


      vis.tooltipFormat(tooltipFormat.bind(vis))
      .showBackdrop(true)
      .showBand(true)
      .showChildren(true)
      .zoomEnabled(false)
      .draw(data.script_info.scenes);

      // const annotations = [{
      //   note: {
      //     label: "Beginning in medias res"
      //   },
      //   //can use x, y directly instead of data
      //   data: { story_order: 0, narrative_order: 29 },
      //   dy: 50,
      //   dx: 50,
      //   subject: {
      //     radius: 20,
      //     radiusPadding: 5
      //   }
      // }];
      // let container = d3.select(document.getElementById('pulp_fiction'))
      //   .select('.visarea');
      // createAnnotations(container, vis, annotations);

    });
  });

  // memento
  fetch('datasets/memento_simple.json').then(function(response){
    response.json().then(function(data){
      // console.log('Memento', data.script_info.scenes);
      var vis = new storycurve('#memento');
      vismap['memento'] = {id:'memento', vis:vis, data:data};

      let characters = rankCharacterByVerbosity(data.script_info, 8);
      let locations = rankMetadataBySceneSize(data.script_info, 'location', 4);
      let times = rankMetadataBySceneSize(data.script_info, 'time', 2);

      vis.bandColorScale().domain(locations);
      vis.backdropColorScale().domain(times);
      vis.childColorScale().domain(characters);

      vis.tooltipFormat(tooltipFormat.bind(vis))
      .showChildren(true)
      .zoomEnabled(false)
      .draw(data.script_info.scenes);
    });
  });
  // $('#memento-video').prettyembed({
  //   videoID:'E77LfnMI-34',
  //   customPreviewImage: 'http://image.tmdb.org/t/p/w300/oBUznaSdjkY3HtQUzAxgdIZqh4w.jpg',
  //   useFitVids: true
  // })

  fetch('datasets/eternal_sunshine_of_the_spotless_mind_simple.json').then(function(response){
    response.json().then(function(data){
      // console.log('Eternal Sunshine', data.script_info.scenes);
      var vis = new storycurve('#eternal_sunshine');
      vismap['eternal_sunshine'] = {id:'eternal_sunshine', vis:vis, data:data};

      let characters = rankCharacterByVerbosity(data.script_info, 8);
      let locations = rankMetadataBySceneSize(data.script_info, 'location', 4);
      let times = rankMetadataBySceneSize(data.script_info, 'time', 2);

      vis.bandColorScale().domain(locations);
      vis.backdropColorScale().domain(times);
      vis.childColorScale().domain(characters);

      vis.tooltipFormat(tooltipFormat.bind(vis))
      .showChildren(true)
      .zoomEnabled(false)
      .draw(data.script_info.scenes);
    });
  });

  fetch('datasets/usual_suspects_simple.json').then(function(response){
    response.json().then(function(data){
      // console.log('Eternal Sunshine', data.script_info.scenes);
      var vis = new storycurve('#usual_suspects');
      vismap['usual_suspects'] = {id:'usual_suspects', vis:vis, data:data};

      let characters = rankCharacterByVerbosity(data.script_info, 8);
      let locations = rankMetadataBySceneSize(data.script_info, 'location', 4);
      let times = rankMetadataBySceneSize(data.script_info, 'time', 2);

      vis.bandColorScale().domain(locations);
      vis.backdropColorScale().domain(times);
      vis.childColorScale().domain(characters);

      vis.tooltipFormat(tooltipFormat.bind(vis))
      .showChildren(true)
      .zoomEnabled(false)
      .draw(data.script_info.scenes);
    });
  });


  fetch('datasets/500_days_of_summer_simple.json').then(function(response){
    response.json().then(function(data){
      // console.log('Eternal Sunshine', data.script_info.scenes);
      var vis = new storycurve('#days_of_summer');
      vismap['days_of_summer'] = {id:'days_of_summer', vis:vis, data:data};

      let characters = rankCharacterByVerbosity(data.script_info, 8);
      let locations = rankMetadataBySceneSize(data.script_info, 'location', 4);
      let times = rankMetadataBySceneSize(data.script_info, 'time', 2);

      // vis.bandColorScale().domain(locations);
      // vis.backdropColorScale().domain(times);
      // vis.childColorScale().domain(characters);

      vis.tooltipFormat(tooltipFormat.bind(vis))
      // .showChildren(true)
      .zoomEnabled(false)
      .size(()=>1)
      .draw(data.script_info.scenes);
    });
  });

  fetch('datasets/fight_club_simple.json').then(function(response){
    response.json().then(function(data){
      // console.log('Eternal Sunshine', data.script_info.scenes);
      var vis = new storycurve('#fight_club');
      vismap['fight_club'] = {id:'fight_club', vis:vis, data:data};

      let characters = rankCharacterByVerbosity(data.script_info, 8);
      let locations = rankMetadataBySceneSize(data.script_info, 'location', 4);
      let times = rankMetadataBySceneSize(data.script_info, 'time', 2);

      vis.bandColorScale().domain(locations);
      vis.backdropColorScale().domain(times);
      vis.childColorScale().domain(characters);

      vis.tooltipFormat(tooltipFormat.bind(vis))
      .showChildren(true)
      .zoomEnabled(false)
      .draw(data.script_info.scenes);
    });
  });

  fetch('datasets/reservoir_dogs_simple.json').then(function(response){
    response.json().then(function(data){
      // console.log('Eternal Sunshine', data.script_info.scenes);
      var vis = new storycurve('#reservoir_dogs');
      vismap['reservoir_dogs'] = {id:'reservoir_dogs', vis:vis, data:data};

      let characters = rankCharacterByVerbosity(data.script_info, 8);
      let locations = rankMetadataBySceneSize(data.script_info, 'location', 4);
      let times = rankMetadataBySceneSize(data.script_info, 'time', 2);

      vis.bandColorScale().domain(locations);
      vis.backdropColorScale().domain(times);
      vis.childColorScale().domain(characters);

      vis.tooltipFormat(tooltipFormat.bind(vis))
      .showChildren(true)
      .showBand(true)
      .showBackdrop(true)
      .zoomEnabled(false)
      .draw(data.script_info.scenes);
    });
  });

  fetch('datasets/12_monkeys_simple.json').then(function(response){
    response.json().then(function(data){
      // console.log('Eternal Sunshine', data.script_info.scenes);
      var vis = new storycurve('#monkeys');
      vismap['monkeys'] = {id:'monkeys', vis:vis, data:data};

      let characters = rankCharacterByVerbosity(data.script_info, 8);
      let locations = rankMetadataBySceneSize(data.script_info, 'location', 4);
      let times = rankMetadataBySceneSize(data.script_info, 'time', 2);

      // vis.bandColorScale().domain(locations);
      // vis.backdropColorScale().domain(times);
      // vis.childColorScale().domain(characters);

      vis.tooltipFormat(tooltipFormat.bind(vis))
      .zoomEnabled(false)
      .size(()=>1)
      .draw(data.script_info.scenes);
    });
  });

  fetch('datasets/prestige_simple.json').then(function(response){
    response.json().then(function(data){
      // console.log('Eternal Sunshine', data.script_info.scenes);
      var vis = new storycurve('#prestige');
      vismap['prestige'] = {id:'prestige', vis:vis, data:data};

      let characters = rankCharacterByVerbosity(data.script_info, 8);
      let locations = rankMetadataBySceneSize(data.script_info, 'location', 4);
      let times = rankMetadataBySceneSize(data.script_info, 'time', 2);
      //
      // vis.bandColorScale().domain(locations);
      // vis.backdropColorScale().domain(times);
      // vis.childColorScale().domain(characters);

      vis.tooltipFormat(tooltipFormat.bind(vis))
      // .showChildren(true)
      .zoomEnabled(false)
      .size(()=>1)
      .draw(data.script_info.scenes);
    });
  });


  fetch('datasets/annie_hall_simple.json').then(function(response){
    response.json().then(function(data){
      // console.log('Eternal Sunshine', data.script_info.scenes);
      var vis = new storycurve('#annie_hall');
      vismap['annie_hall'] = {id:'annie_hall', vis:vis, data:data};

      let characters = rankCharacterByVerbosity(data.script_info, 8);
      let locations = rankMetadataBySceneSize(data.script_info, 'location', 4);
      let times = rankMetadataBySceneSize(data.script_info, 'time', 2);

      vis.bandColorScale().domain(locations);
      vis.backdropColorScale().domain(times);
      vis.childColorScale().domain(characters);

      vis.tooltipFormat(tooltipFormat.bind(vis))
      .showChildren(true)
      .zoomEnabled(false)
      .draw(data.script_info.scenes);
    });
  });
};

function createAnnotations(container, vis, annotations){
  let type = d3.annotationCalloutCircle;

  const xs = vis.xs();
  const ys = vis.ys();
  const makeAnnotations = d3.annotation()
    .editMode(false)
    .type(type)
    .accessors({
      x: d => xs(d.story_order),
      y: d => ys(d.narrative_order)
    })
    .annotations(annotations)

  container.append("g")
    .attr("class", "annotation-group")
    .call(makeAnnotations)
}

window.onresize = function(){
  console.log('window resize');
  for (var [key, value] of Object.entries(vismap)){
    let elem = document.getElementById(value.id);
    if (elem.style.display=='none'){
      continue;
    }

    let width = elem.offsetWidth;
    if (value.vis.width()==width){
      continue;
    }
    let height = width/3<200?200:width/3;

    value.vis.width(width)
      .height(height)
      .draw(value.data.script_info.scenes);
  }
}

function rankCharacterByVerbosity(data, limit){
  // ranking characters and choose top ones, and put the rest into one line
  let ranked = data.characters
    .sort((a,b)=>b.overall_verbosity-a.overall_verbosity)
    .slice(0, limit)
    .map(d=>d.name);//descending

  data.scenes.forEach(d=>{
    d.characters = d.characters
      .filter(c=>ranked.includes(c))// remove characters not in the top ranking
      .sort((a,b)=>ranked.indexOf(a)-ranked.indexOf(b));//sort per scene
  });
  return ranked;
}


function rankMetadataBySceneSize(data, type, limit){
  let scenes = data.scenes;

  let aggregates = d3.nest()
    .key(d=>d.scene_metadata[type])
    .rollup(function (v) {
      return d3.sum(v, (d)=>d.scene_metadata.size);
    })
    .entries(scenes);
  aggregates = aggregates.filter(d=>d.key!='null');

  aggregates.sort(function (a, b) {
    return b.value - a.value;
  });

  aggregates = aggregates.slice(0, limit);
  // console.log(aggregates);
  let topItems = aggregates.map(d=>d.key);
  scenes.map(s=>{
    if (topItems.includes(s.scene_metadata[type])==false){
        s.scene_metadata[type] = null;
    }
  });
  return aggregates.map(d=>d.key).sort();
}

function tooltipFormat(d){
  let childColor = this.childColorScale();

  var scene = d.orgData;

  let content = '<p>';
  content += '<strong style="color:#757575">S, N = ' + d.xo + ', ' + d.yo + '</strong><br>';

  scene.characters.map(c=>{
    content += ('<strong style="color:'+ childColor(c)+'">'+c+'</strong><br>');
  });
  let loc = scene.scene_metadata.location;
  if (loc){
    content += ('<strong style="color:#9E9E9E">'+loc+'</strong><br>');
  }

  let time = scene.scene_metadata.time;
  if (time){
    content += ('<strong style="color:#9E9E9E">'+time+'</strong><br>');
  }
  content += '</p>';
  // content += ('<tr><td><span style="color:#767676">S.order</span></td><td>&nbsp; ' + d.so + '</td></tr>');

  return content;
}
