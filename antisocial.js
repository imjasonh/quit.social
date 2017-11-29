var visits = window.localStorage.getItem(SITE);
if (visits == null || visits == '') { visits = '[]'; }
visits = JSON.parse(visits);
var now = new Date().getTime();
var cutoff = now - 7*24*60*60*1000; // One week ago.
visits = visits.filter(function(v) { return v > cutoff; });
visits.push(now);
window.localStorage.setItem(SITE, JSON.stringify(visits));

var count = visits.length;
var times = '' + count + ' times';
if (count == 1) { times = ' one time'; }
document.getElementById('text').innerText = 'You have tried to visit ' + SITE + ' ' +times+' in the last week.';

document.getElementById('reset').onclick = function() {
  window.localStorage.clear(SITE);
  document.getElementById('text').innerText = 'You have not tried to visit ' + SITE + ' in the last week. Keep it up!';
};
