
function floatToPercentString(num){
    return num * 100 + '%';
}

function posAdd(pos1, pos2){
    return {
        x: pos1.x + pos2.x,
        y: pos1.y + pos2.y
    }
}

function rowIndexToOffset(index) {
    return {
        x: ((currentPageIndex === 0) ? pageOffset : normalPageOffset).x,
        y: ((currentPageIndex === 0) ? pageOffset : normalPageOffset).y + index * (rowSpace + (lineNum - 1) * lineSpace)
    };
}

function barIndexToOffset(indexRow, indexBar, headWidth, length){
    var o = rowIndexToOffset(indexRow);
    return {
        x: o.x + headWidth + indexBar*length,
        y: o.y
    }
}

function nameToOffsetY(name, char){
    // 相对于第五线的下偏移量
    // 高音谱号 f2
    var interval;
    // interval: 把name的音移动到f2需要移动的次数（每次移动是行距的一半）

    // sharp/flat/nature
    if (char === '-' || char === '.' || char === '/' ||
        ('a'.charCodeAt() <= char.charCodeAt() && char.charCodeAt() <= 'n'.charCodeAt()) ||
        ('A'.charCodeAt() <= char.charCodeAt() && char.charCodeAt() <= 'N'.charCodeAt())){
        if ('a'.charCodeAt(0) <= name.charCodeAt(0) && name.charCodeAt(0) <= 'g'.charCodeAt(0)){
            interval = difference('f2', name);
        }
        else if ('A'.charCodeAt(0) <= name.charCodeAt(0) && name.charCodeAt(0) <= 'G'.charCodeAt(0)){
            interval = difference('f2', name);

        }
        return charToF2Offset(char) + interval * lineSpace / 2;
    }
    // 休止符
    if (('O'.charCodeAt() <= char.charCodeAt() && char.charCodeAt() <= 'Z'.charCodeAt())){

        return charToF2Offset(char);
    }

    // 连线
    if (char === legerLineChar){
        if (name === 'e1'){
            return -13;
        }
        else if (name === 'f2'){
            return -53;
        }
    }
}

function charToF2Offset(char) {
    if (char === '-'){
        return -54;
    }
    if (char === '.' || char === '/'
        || ('a'.charCodeAt() <= char.charCodeAt() && char.charCodeAt() <= 'n'.charCodeAt())) {
        return -53;
    }
    if ('A'.charCodeAt() <= char.charCodeAt() && char.charCodeAt() <= 'N'.charCodeAt()){
        return -53;
    }
    if ('O'.charCodeAt() <= char.charCodeAt() && char.charCodeAt() <= 'Z'.charCodeAt()){
        return -20;
    }
}

function itemToTextChar(name, rate, type){
    if (typeof rate === 'number'){
        rate = rate.toString();
    }
    switch (type){
        case 'note':
            var origin = noteChar[rate];
            // 小字
            if (name === name.toLowerCase()){
                if (name[1] === undefined || name[1] === '0' || name[1] === '1'){
                    origin = origin.toUpperCase();
                }
            }
            // 大字
            else{
                origin = origin.toUpperCase();
            }
            return origin;
        case 'rest':
            return restChar[rate];
        case 'clef':
            return clefChar[name];
        case 'key':
            return keyChar[name];
    }


}

function noteToValue(name){
    // note转化为值
    // c -> 0
    // b -> 6

    // 小字
    if (name[0].toLowerCase() === name[0])
    {
        return (name.charCodeAt(0) - 'c'.charCodeAt() + 7) % 7 + ((name[1] === undefined) ? 0 : Number(name[1])) * 7;
    }
    else{
        return (name.charCodeAt(0) - 'C'.charCodeAt() + 7) % 7 - 7 - ((name[1] === undefined) ? 0 : Number(name[1])) * 7
    }
}

function difference(name1, name2){
    return noteToValue(name1) - noteToValue(name2);
}

function higherThan(name1, name2){
    return (noteToValue(name1) > noteToValue(name2));
}

function valueToNote(val){
    var ans = '';
    if (val >= 0){
        ans += String.fromCharCode((val % 7 + 2) % 7 - 2 + 'c'.charCodeAt());
        if (val !== noteToValue(ans)){
            ans += (val - noteToValue(ans))/7;
        }
        return ans;
    }
    else{
        for (var i = 'A'.charCodeAt(); i <= 'G'.charCodeAt(); i++)
        {
            if (noteToValue(String.fromCharCode(i)) === val){
                return String.fromCharCode(i);
            }
            else{
                for (var j = 1; j <= 10;j++){
                    if (noteToValue(String.fromCharCode(i) + j) === val){
                        return String.fromCharCode(i) + j;
                    }
                }
            }
        }
    }
}

function charToDotChar(char){
    if ('a'.charCodeAt() <= char.toLowerCase().charCodeAt(0) &&
        char.toLowerCase().charCodeAt(0) <= 'e'.charCodeAt()){
        return String.fromCharCode(char.charCodeAt(0) + 6);
    }
    if ('O'.charCodeAt() <= char.charCodeAt(0) &&
        char.charCodeAt(0) <= 'S'.charCodeAt()){
        return String.fromCharCode(char.charCodeAt(0) + 6);
    }
    return char;
}

function dotCharToChar(char){
    if ('g'.charCodeAt() <= char.toLowerCase().charCodeAt(0) &&
        char.toLowerCase().charCodeAt(0) <= 'k'.charCodeAt()){
        return String.fromCharCode(char.charCodeAt(0) - 6);
    }
    if ('U'.charCodeAt() <= char.charCodeAt(0) &&
        char.charCodeAt(0) <= 'Y'.charCodeAt()){
        return String.fromCharCode(char.charCodeAt(0) - 6);
    }
    return char;
}

function isTailAvailable(note1, note2){
    if (note1 === undefined || note2 === undefined){
        return false;
    }
    if (note1.type !== 'note' || note2.type !== 'note'){
        return false;
    }
    if (note1.inTail === true || note2.inTail === true){
        return false;
    }
    return (
        (note1.rate === 8 && note2.rate === 8) ||
        (note1.rate === 16 && note2.rate === 16) ||
        (note1.rate === 32 && note2.rate === 32) ||
        (note1.rate === 8 && note2.rate === 16 && note1.dotStatus === true) ||
        (note1.rate === 16 && note2.rate === 8 && note2.dotStatus === true) ||
        (note1.rate === 16 && note2.rate === 32 && note1.dotStatus === true) ||
        (note1.rate === 32 && note2.rate === 16 && note2.dotStatus === true)
    );
}

function inNoteRect(pos, note){
    var boundingOffset = getBoundingOffset(note.char);
    var start = {
        x: note.offset.x + note.noteSpace * (note.index+1) + noteWidth * note.index - noteWidth/2 + boundingOffset.start.x,
        y: note.offset.y + nameToOffsetY(note.name, note.char) + boundingOffset.start.y
    };
    var end = {
        x: note.offset.x + note.noteSpace * (note.index+1) + noteWidth * note.index - noteWidth/2 + boundingOffset.end.x,
        y: note.offset.y + nameToOffsetY(note.name, note.char) + boundingOffset.end.y
    };
    return (start.x <= pos.x && pos.x <= end.x &&
            start.y <= pos.y && pos.y <= end.y);
}

function getBoundingOffset(char){

    var originWidth = 12;
    var dotWidth = 23;
    var originHeight = 46;
    var tailHeight = 38;
    var restHeight = 20;
    if (char === 'a' || char === 'A'){
        return {
            start: {
                x: 0,
                y: originHeight
            },
            end: {
                x: originWidth,
                y: originHeight + lineSpace + 2
            }
        }
    }
    if (char === 'g' || char === 'G'){
        return {
            start: {
                x: 0,
                y: originHeight
            },
            end: {
                x: dotWidth,
                y: originHeight + lineSpace
            }
        }
    }
    if ('b'.charCodeAt() <= char.charCodeAt() && char.charCodeAt() <= 'f'.charCodeAt()){
        return {
            start: {
                x: 0,
                y: originHeight
            },
            end: {
                x: originWidth,
                y: originHeight + tailHeight
            }
        }
    }
    if ('B'.charCodeAt() <= char.charCodeAt() && char.charCodeAt() <= 'F'.charCodeAt()){
        return {
            start: {
                x: 0,
                y: originHeight - tailHeight + lineSpace
            },
            end: {
                x: originWidth,
                y: originHeight + lineSpace + 2
            }
        }
    }
    if ('h'.charCodeAt() <= char.charCodeAt() && char.charCodeAt() <= 'k'.charCodeAt()){
        return {
            start: {
                x: 0,
                y: originHeight
            },
            end: {
                x: dotWidth,
                y: originHeight + tailHeight
            }
        }
    }
    if ('H'.charCodeAt() <= char.charCodeAt() && char.charCodeAt() <= 'K'.charCodeAt()){
        return {
            start: {
                x: 0,
                y: originHeight - tailHeight + lineSpace
            },
            end: {
                x: dotWidth,
                y: originHeight + lineSpace + 2
            }
        }
    }
    if ('O'.charCodeAt() <= char.charCodeAt() && char.charCodeAt() <= 'Y'.charCodeAt()){
        return {
            start: {
                x: 0,
                y: restHeight
            },
            end: {
                x: originWidth,
                y: restHeight + 32
            }
        }
    }
}

function maxRow (){
    if (currentPageIndex === 0){
        return parseInt((pageHeight - pageOffset.y) / (lineSpace * (lineNum-1) + rowSpace));
    }
    else{
        return parseInt((pageHeight - normalPageOffset.y) / (lineSpace * (lineNum-1) + rowSpace));
    }
}
