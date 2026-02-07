// Prevent dark-mode flash by applying theme synchronously before React loads
try {
  var t = localStorage.getItem('theme');
  if (t === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
} catch(e) {}
