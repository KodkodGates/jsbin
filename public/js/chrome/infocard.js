(function () {
  'use strict';
  /*global $:true, jsbin:true, prettyDate:true, EventSource:true, throttle:true*/

  var $template = $($('#infocard').html()); // donkey way of cloning from template
  var $header = $template.find('header');
  var meta = jsbin.state.metadata || {};
  var classes = [];

  if (meta.name) {
    $header.find('.name b').html(meta.name);
    $header.find('img').attr('src', meta.avatar);
  }

  $header.find('time').html(prettyDate(meta.updated));

  if (!jsbin.checksum) {
    classes.push('meta');
  }

  if (meta.pro) {
    classes.push('pro');
  }

  if (jsbin.user && (meta.name === jsbin.user.name)) {
    classes.push('author');
  }

  $header.find('.visibility').text(meta.visibility);

  if (meta.visibility === 'private') {
    classes.push('private');
  } else if (meta.visibility === 'public') {
    classes.push('public');
  } // TODO handle team

  if (jsbin.state.code) {
    $template.addClass(classes.join(' ')).appendTo('body');

    $header.click(function (e) {
      e.preventDefault();
      $template.toggleClass('open');
    });

    var viewers = 0;

    var es = new EventSource(jsbin.getURL() + '/stats');
    es.addEventListener('stats', throttle(function (event) {
      var data = JSON.parse(event.data);

      if (data.connections > 0 && viewers === 0) {
        $template.addClass('viewers');
      }

      if (viewers !== data.connections) {
        var $b = $header.find('.viewers b').removeClass('up down').html('<b>' + data.connections + '<br>' + viewers + '<br>' + data.connections + '</b>'),
            c = viewers > data.connections ? 'down' : 'up';
        setTimeout(function () {
          $b.addClass(c);
        }, 0);
      }

      viewers = data.connections;

      if (viewers === 0) {
        setTimeout(function () {
          $template.removeClass('viewers');
        }, 250);
      }
    }, 1000));
  }
})();