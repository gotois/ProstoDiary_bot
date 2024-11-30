if (!sessionStorage.getItem('install')) {
  const domain = 'gotois_bot'
  setTimeout(function() {
    window.location = "tg:\/\/resolve?domain=" + domain;
    sessionStorage.setItem('install', String(1));
  }, 100);
}
