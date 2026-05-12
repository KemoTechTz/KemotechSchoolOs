(function(){
  const stamp=document.querySelector('[data-portal-stamp]');
  if(stamp){
    stamp.textContent=new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});
  }
})();
