if (!localStorage.getItem('install')) {
  setTimeout(function() {
    window.location = "tg:\/\/resolve?domain=ProstoDiary_bot";
    localStorage.setItem('install', String(1));
  }, 100);
}
