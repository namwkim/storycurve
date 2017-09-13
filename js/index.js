

window.onload=function(){
  console.log('initializing...');

  document.getElementById('bibtex-btn').addEventListener('click', function(){
    var text = document.getElementById('bibtex-text');
    if (text.style.display === 'none') {
        text.style.display = 'block';
    } else {
        text.style.display = 'none';
    }
  })

  document.getElementById('bibtex-btn').addEventListener('click', function(){
    var text = document.getElementById('bibtex-text');
    if (text.style.display === 'none') {
        text.style.display = 'block';
    } else {
        text.style.display = 'none';
    }
  })

};

function togglePattern(id, target) {
  var pattern =  document.getElementById(id+'_pattern');
  var vis = document.getElementById(id);
  if (pattern.style.display==='none'){
    pattern.style.display = 'block';
    vis.style.display = 'none';
    target.innerHTML = 'Hide Patterns';
  }else{
    pattern.style.display = 'none';
    vis.style.display = 'block';
    target.innerHTML = 'Show Patterns';
  }

}
//------------- handling navbar burger on mobile ----------------------------//
document.addEventListener('DOMContentLoaded', function () {

  // Get all "navbar-burger" elements
  var $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);

  // Check if there are any nav burgers
  if ($navbarBurgers.length > 0) {

    // Add a click event on each of them
    $navbarBurgers.forEach(function ($el) {
      $el.addEventListener('click', function () {

        // Get the target from the "data-target" attribute
        var target = $el.dataset.target;
        var $target = document.getElementById(target);

        // Toggle the class on both the "navbar-burger" and the "navbar-menu"
        $el.classList.toggle('is-active');
        $target.classList.toggle('is-active');

      });
    });
  }

});
