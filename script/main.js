
window.onload = function(){

    loadFonts();
    loadDom();
    document.addEventListener('mouseover', function(event){
        event.preventDefault();
    });
    var timer = setTimeout(function(){
        music[currentPageIndex] = new Page(pageDom, currentPageIndex, 'G', 'C', '4/4');
        
    }, 500);
    
    addClickButtonEvent();
    createDialog();

    document.onkeydown = documentKeyDownResponse;

};

function loadFonts(){
    try{
        akvoFont = new FontFace('akvo', 'url(./akvo/akvo.ttf)');
        akvoFont.load().then(function(font){
            document.fonts.add(font);
            console.info('load font finish');
        });
    }catch(err){
        console.log('load fail');
    }
}

function loadDom(){
    pageDom = $('.page').get(0);
}
