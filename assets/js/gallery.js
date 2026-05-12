(function(){
  const count=document.querySelector('[data-gallery-count]');
  const items=document.querySelectorAll('[data-gallery-grid] [data-category]');
  if(count&&items.length) count.textContent=String(items.length);
})();
