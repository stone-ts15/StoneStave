/**
 * Created by lenovo on 2017/7/24.
 */

window.onload = function(){

    loadFonts();
    loadDom();
    document.addEventListener('mouseover', function(event){
        event.preventDefault();
    });
    var timer = setTimeout(function(){
        music[currentPageIndex] = new Page(pageDom, currentPageIndex, 'G', 'G', '4/4');
        //c = new Cursor(page, 0, 0, 0);
    }, 500);
    // page = new Page(pageDom);
    // var ch = $('#page').get(0).getContext('2d');
    // for (var i = 0; i < 5; i++){
    //     ch.beginPath();
    //     ch.moveTo(20, 20 + i * 10 + 0.5);
    //     ch.lineTo(700, 20 + i * 10 + 0.5);
    //     ch.lineWidth = 1;
    //     ch.stroke();
    // }
    // ch.closePath();
    // ch.arc(200, 200, 1, 0, 2*Math.PI);
    // ch.fill();
    addClickButtonEvent();
    createDialog();
    // loadSoundSource();

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
