
window.onload=function(){
  console.log('initializing...');
  // memento
  console.log(StoryCurve);
  fetch('datasets/memento.json').then(function(response){
    response.json().then(function(data){
      console.log('Memento', data.script_info.scenes);
      var vis = new StoryCurve('#memento');
      console.log(vis);
      vis.draw(data.script_info.scenes);
    });
  });
};
