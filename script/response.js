function addClickButtonEvent(){
    $('button.note').each(function(index){
        this.addEventListener('click', function(){
            operation.mode = 'note';
            operation.rate = Number($(this).attr('rate'));
        }, true);
    });
    $('button.rest').each(function(index){
        this.addEventListener('click', function(){
            operation.mode = 'rest';
            operation.rate = Number($(this).attr('rate'));
        }, true);
    });
    $('button.save').button().click(function() {
        saveCurrentPageToPng();
    });
}

function createDialog(){
    $('div.title').dialog({
        autoOpen: false,
        height: 300,
        width: 350,
        modal: true,
        buttons: {
            '提交': function(){
                music[0].updateTitle($('[name="title"]').val());
                inSet = false;
                $(this).dialog('close');
            }
        },
        close: function(){
            inSet = false;
        }
    });
    $('button.title').button().click(function() {
            inSet = true;
            $('div.title').dialog( "open" );
        });

    $('div.author').dialog({
        autoOpen: false,
        height: 300,
        width: 350,
        modal: true,
        buttons: {
            '提交': function(){
                music[0].updateAuthor($('[name="author"]').val());
                inSet = false;
                $(this).dialog('close');
            }

        },
        close: function(){
            inSet = false;
        }
    });
    $('button.author').button().click(function() {
        inSet = true;
        $('div.author').dialog( "open" );
    });

    $('div.clef').dialog({
        autoOpen: false,
        height: 300,
        width: 350,
        modal: true,
        buttons: {
            '提交': function(){
                music[currentPageIndex].updateClef($('div.clef input:checked').val());
                inSet = false;
                $(this).dialog('close');

            }
        },
        close: function(){
            inSet = false;
        }
    });
    $('button.clef').button().click(function() {
        inSet = true;
        $('div.clef').dialog( "open" );
    });

    $('div.key').dialog({
        autoOpen: false,
        height: 300,
        width: 350,
        modal: true,
        buttons: {
            '提交': function(){
                music[currentPageIndex].updateKey($('#name input:checked').val() , $('#accidental input:checked').val());
                inSet = false;
                $(this).dialog('close');
            }
        },
        close: function(){
            inSet = false;
        }
    });
    $('button.key').button().click(function() {
        inSet = true;
        $('div.key').dialog( "open" );
    });

    $('div.time').dialog({
        autoOpen: false,
        height: 300,
        width: 350,
        modal: true,
        buttons: {
            '提交': function(){
                music[0].updateTime($('div.time input:checked').val());
                inSet = false;
                $(this).dialog('close');
            }
        },
        close: function(){
            inSet = false;
        }
    });
    $('button.time').button().click(function() {
        inSet = true;
        $('div.time').dialog( "open" );
    });

    $('div.tempo').dialog({
        autoOpen: false,
        height: 300,
        width: 350,
        modal: true,
        buttons: {
            '提交': function(){
                music[0].updateTempo($('div.tempo input').val());
                inSet = false;
                $(this).dialog('close');
            }
        },
        close: function(){
            inSet = false;
        }
    });
    $('button.tempo').button().click(function() {
        inSet = true;
        $('div.tempo').dialog( "open" );
    });
}

function documentKeyDownResponse(event){
    autoCreateNoteFromKey(event);
}

function autoCreateNoteFromKey(event){
    // 只支持G谱号c1，c2，c3
    if (inSet){
        return;
    }
    switch (event.keyCode){
        // 放置音符
        case 49:
        case 97:
        case 50:
        case 98:
        case 51:
        case 99:
            drawNote(event.keyCode);
            break;
        // 休止符
        case 48:
        case 96:
            drawRest();
            break;
        // 左右移动
        case 37:
        case 39:
            event.preventDefault();
            moveCursorHorizontal(event.keyCode);
            break;
        // 上下移动，支持音符和小节
        case 38:
        case 40:
            event.preventDefault();
            if (music[currentPageIndex].cursor.index === 0){
                moveCursorVertical(event.keyCode);
            }
            else{
                moveNote(event.keyCode);
            }
            break;
        // 添加和消除临时升降号
        case 83:
        case 70:
        case 78:
        case 69:
            noteAccidental(event.keyCode);
            break;
        // 添加和消除附点
        case 68:
            noteDot(event.keyCode);
            break;
        // 删除音符
        case 8:
            deleteNote();
            break;
        // 翻页
        case 33:
        case 34:
            event.preventDefault();
            changePage(event.keyCode);
            break;
        default:
            break;
    }
}

function changePage(keyCode){
    if (keyCode === 33){
        if (currentPageIndex > 0){
            music[currentPageIndex].svgItem.hide();
            currentPageIndex--;
            music[currentPageIndex].svgItem.show();
        }
    }
    else if (keyCode === 34){
        music[currentPageIndex].svgItem.hide();
        currentPageIndex++;
        if (currentPageIndex < music.length){
            music[currentPageIndex].svgItem.show();
        }
        else{
            music[currentPageIndex] = new Page(
                pageDom,
                currentPageIndex,
                music[currentPageIndex-1].clef,
                music[currentPageIndex-1].keySignature,
                music[currentPageIndex-1].timeSignature
            );
        }
    }
}

function drawNote(keyCode){
    var name;
    switch (keyCode){
        case 49:
        case 97:
            name = 'c1';
            break;
        case 50:
        case 98:
            name = 'c2';
            break;
        case 51:
        case 99:
            name = 'c3';
            break;
        default:
            break;
    }

    if (operation.mode === 'note' && name !== ''){
        if (music[currentPageIndex].cursor.barObj.insertNote(music[currentPageIndex].cursor.index, name) === true){
            music[currentPageIndex].cursor.cancelHighlightNote();
            music[currentPageIndex].cursor.index++;
            music[currentPageIndex].cursor.update();
            music[currentPageIndex].cursor.highlightNote();
        }
    }
}

function drawRest(){
    if (operation.mode === 'rest'){
        if (music[currentPageIndex].cursor.barObj.insertNote(music[currentPageIndex].cursor.index, '') === true){
            music[currentPageIndex].cursor.cancelHighlightNote();
            music[currentPageIndex].cursor.index++;
            music[currentPageIndex].cursor.update();
            music[currentPageIndex].cursor.highlightNote();
        }
    }
}

function moveCursorHorizontal(keyCode){
    music[currentPageIndex].cursor.cancelHighlightNote();
    if (keyCode === 37){
        if (music[currentPageIndex].cursor.index === 0){
            if (music[currentPageIndex].cursor.bar === 0){
                if (music[currentPageIndex].cursor.row === 0){
                    //return;
                }
                else{
                    music[currentPageIndex].cursor.row--;
                    music[currentPageIndex].cursor.bar = music[currentPageIndex].cursor.spage.rows[music[currentPageIndex].cursor.row].bars.length-1;
                    music[currentPageIndex].cursor.index = music[currentPageIndex].cursor.spage.rows[music[currentPageIndex].cursor.row].bars[music[currentPageIndex].cursor.bar].notes.length;
                }
            }
            else{
                music[currentPageIndex].cursor.bar--;
                music[currentPageIndex].cursor.index = music[currentPageIndex].cursor.spage.rows[music[currentPageIndex].cursor.row].bars[music[currentPageIndex].cursor.bar].notes.length;
            }
        }
        else{
            music[currentPageIndex].cursor.index--;
        }
    }
    else if (keyCode === 39){
        if (music[currentPageIndex].cursor.index === music[currentPageIndex].cursor.spage.rows[music[currentPageIndex].cursor.row].bars[music[currentPageIndex].cursor.bar].notes.length){
            if (music[currentPageIndex].cursor.bar === music[currentPageIndex].cursor.spage.rows[music[currentPageIndex].cursor.row].bars.length-1){
                if (music[currentPageIndex].cursor.row === music[currentPageIndex].cursor.spage.rows.length-1){
                    // 不要翻页
                }
                else{
                    music[currentPageIndex].cursor.row++;
                    music[currentPageIndex].cursor.bar = 0;
                    music[currentPageIndex].cursor.index = 0;
                }
            }
            else{
                music[currentPageIndex].cursor.bar++;
                music[currentPageIndex].cursor.index = 0;
            }
        }
        else{
            music[currentPageIndex].cursor.index++;
        }
    }
    music[currentPageIndex].cursor.update();
    music[currentPageIndex].cursor.highlightNote();
}

function moveCursorVertical(keyCode){
    music[currentPageIndex].cursor.cancelHighlightNote();
    if (keyCode === 38){
        if (music[currentPageIndex].cursor.row === 0){
        }
        else{
            music[currentPageIndex].cursor.row--;
            music[currentPageIndex].cursor.bar = Math.min(music[currentPageIndex].cursor.bar, music[currentPageIndex].cursor.spage.rows[music[currentPageIndex].cursor.row].bars.length-1);
            music[currentPageIndex].cursor.index = Math.min(music[currentPageIndex].cursor.index, music[currentPageIndex].cursor.spage.rows[music[currentPageIndex].cursor.row].bars[music[currentPageIndex].cursor.bar].notes.length);
        }
    }
    else if (keyCode === 40){
        if (music[currentPageIndex].cursor.row === music[currentPageIndex].cursor.spage.rows.length-1){
        }
        else{
            music[currentPageIndex].cursor.row++;
            music[currentPageIndex].cursor.bar = Math.min(music[currentPageIndex].cursor.bar, music[currentPageIndex].cursor.spage.rows[music[currentPageIndex].cursor.row].bars.length-1);
            music[currentPageIndex].cursor.index = Math.min(music[currentPageIndex].cursor.index, music[currentPageIndex].cursor.spage.rows[music[currentPageIndex].cursor.row].bars[music[currentPageIndex].cursor.bar].notes.length);
        }
    }
    music[currentPageIndex].cursor.update();
    music[currentPageIndex].cursor.highlightNote();
}

function moveNote(keyCode){
    if (keyCode === 38){
        music[currentPageIndex].cursor.barObj.raiseNote(music[currentPageIndex].cursor.index-1);
    }
    else if (keyCode === 40){
        music[currentPageIndex].cursor.barObj.fallNote(music[currentPageIndex].cursor.index-1);
    }
    console.log(music[currentPageIndex].cursor.barObj.notes[music[currentPageIndex].cursor.index-1].name);
}

function noteAccidental(keyCode){
    if (music[currentPageIndex].cursor.index === 0){
        return;
    }
    switch (keyCode){
        // 升降
        case 83: // S
            music[currentPageIndex].cursor.barObj.accidentalOperate(music[currentPageIndex].cursor.index-1, 'sharp');
            break;
        case 70: // F
            music[currentPageIndex].cursor.barObj.accidentalOperate(music[currentPageIndex].cursor.index-1, 'flat');
            break;
        case 78: // N
            music[currentPageIndex].cursor.barObj.accidentalOperate(music[currentPageIndex].cursor.index-1, 'nature');
            break;
        case 69: // E
            music[currentPageIndex].cursor.barObj.accidentalOperate(music[currentPageIndex].cursor.index-1, '');
            break;
        default:
            break;
    }
}

function noteDot(keyCode){
    if (music[currentPageIndex].cursor.index === 0){
        return;
    }
    music[currentPageIndex].cursor.barObj.dotOperate(music[currentPageIndex].cursor.index-1);
}

function deleteNote(){
    if (music[currentPageIndex].cursor.index === 0){
        return;
    }
    music[currentPageIndex].cursor.barObj.deleteNote(music[currentPageIndex].cursor.index-1);
    music[currentPageIndex].cursor.index--;
    music[currentPageIndex].cursor.update();
    music[currentPageIndex].cursor.highlightNote();
}

function saveCurrentPageToPng(){
    music[currentPageIndex].cursor.cancelHighlightNote();
    music[currentPageIndex].cursor.line.move(-99, -99);
    $('.page *')[0].style.backgroundColor = '#ffffff';
    saveSvgAsPng($('.page *')[0], 'page_' + (currentPageIndex+1) + '.png');
    music[currentPageIndex].cursor.update();
    music[currentPageIndex].cursor.highlightNote();
}
