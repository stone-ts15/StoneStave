
function Page(container, index, clef, keySignature, timeSignature){
    var _this = this;

    this.dom = container;
    this.index = index;
    this.svgItem = SVG(this.dom).size(840, 1188);
    this.title = {obj: null, text: '标题'};
    this.author = {obj: null, text: '作者'};
    this.clef = clef;
    this.keySignature = keySignature;
    this.timeSignature = timeSignature;
    this.rows = [];
    this.cursor = null;
    this.tempo = {obj: [], val: 90};

    this.drawRows = function () {

        for (var j = 0; j < maxRow(); j++){
            _this.rows.push(new Row(_this, _this.svgItem, j, _this.clef, _this.keySignature, _this.timeSignature));
        }
    };
    this.clickResponse = function (event) {
        var pos = {
            x: event.x - _this.dom.getBoundingClientRect().left,
            y: event.y - _this.dom.getBoundingClientRect().top
        };

        for (var i = 0; i < _this.rows.length; i++){
            for (var j = 0; j < _this.rows[i].bars.length; j++){
                for (var k = 0; k < _this.rows[i].bars[j].notes.length; k++){
                    // 选中该音符
                    if (inNoteRect(pos, _this.rows[i].bars[j].notes[k])){
                        _this.cursor.cancelHighlightNote();
                        _this.cursor.row = i;
                        _this.cursor.bar = j;
                        _this.cursor.index = k+1;
                        _this.cursor.update();
                        _this.cursor.highlightNote();
                        break;
                    }
                }
            }
        }
    };
    this.drawPageIndex = function () {
        _this.pageIndexObj = _this.svgItem.text((_this.index+1).toString()).font({
            family: 'akvo',
            size: 36
        }).move(pageSize.x / 2 + pageIndexOffset.x, pageSize.y + pageIndexOffset.y);
    };
    this.updateTitle = function (title) {
        _this.title.text = title;
        try{_this.title.obj.remove();}catch(e){}
        _this.title.obj = _this.svgItem.text(_this.title.text).font({family: 'Microsoft Yahei', size: 40});
        _this.title.obj.move(pageWidth / 2 - 40*(_this.title.text.length)/2, 40);
    };
    this.updateAuthor = function (author) {
        _this.author.text = author;
        try{_this.author.obj.remove();}catch(e){}
        _this.author.obj = _this.svgItem.text(_this.author.text).font({family: 'Microsoft Yahei', size: 28});
        _this.author.obj.move(pageWidth - 28*(_this.author.text.length) - pageOffset.x, 100);
    };
    this.updateClef = function(clef){
        _this.clef = clef;
        for (var i = 0; i < _this.rows.length; i++){
            _this.rows[i].clef = _this.clef;
            _this.rows[i].drawClef();
        }
    };
    this.updateKey = function(name, accidental){
        _this.keySignature = name + ((accidental === '') ? '' : ('-' + accidental));
        for (var i = 0; i < _this.rows.length; i++){
            _this.rows[i].keySignature = _this.keySignature;
            _this.rows[i].drawKey();
        }
        if (_this.index === 0){

            _this.rows[0].drawTime();
        }
    };
    this.updateTime = function(time){
        _this.timeSignature = time;
        _this.rows[0].drawTime(time);
    };
    this.updateTempo = function (tempo) {
        _this.tempo.val = tempo;
        try{_this.tempo.obj[1].remove()}catch(e){}
        _this.tempo.obj[0] = _this.svgItem.text('C').font({family: 'akvo', size: 32}).move(120, 120);
        _this.tempo.obj[1] = _this.svgItem.text(' = ' + _this.tempo.val).font({family: 'serif', size: 24}).move(140, 145);
    };
    this.hideElem = function () {
        _this.title.obj.hide();
        _this.author.obj.hide();
        _this.tempo.obj[0].hide();
        _this.tempo.obj[1].hide();
    };
    this.showElem = function () {
        _this.title.obj.show();
        _this.author.obj.show();
        _this.tempo.obj[0].show();
        _this.tempo.obj[1].show();
    };


    // init
    this.dom.style.cursor = 'default';
    if (this.index === 0){
        this.updateTitle('标题');
        this.updateAuthor('作者');
        this.updateTempo(90);
    }

    this.drawRows();

    this.dom.addEventListener('click', this.clickResponse, true);
    this.dom.addEventListener('mouseover', function(event){
        event.preventDefault();
    });
    this.drawPageIndex();
    this.cursor = new Cursor(this, 0, 0, 0);
    return this;
}

function Row(spage, svg, index, clef, keySignature, timeSignature){
    var _this = this;

    this.spage = spage;
    this.svgItem = svg;
    this.index = index;
    this.offset = rowIndexToOffset(this.index);
    this.clef = clef;
    this.keySignature = keySignature;
    this.timeSignature = {
        num: Number(timeSignature.substring(0, timeSignature.indexOf('/'))),
        unit: Number(timeSignature.substring(timeSignature.indexOf('/') + 1))
    };
    this.barNum = barPerRow;
    this.lines = [];
    this.bars = [];
    this.keySvg = [];
    this.keyNum = 0;
    this.preCursorX = 0;
    this.times = [];


    this.drawLines = function () {

        for (var i = 0; i < lineNum; i++){
            _this.lines[i] = this.svgItem.line(this.offset.x, this.offset.y + lineSpace*i,
                this.offset.x + lineLength, this.offset.y + lineSpace*i);
            _this.lines[i].stroke({width: horizontalLineWidth, color: lineColor});
        }
    };

    this.createBars = function () {
        for (var i = 0; i < barPerRow; i++){
            _this.bars[i] = new Bar(_this.spage, _this.svgItem, _this.index, i, _this.headWidth,
                _this.timeSignature.num * 4 / _this.timeSignature.unit);
        }
    };
    this.drawClef = function(){
        try{_this.clefSvg.remove()}catch(e){}
        _this.clefSvg = _this.svgItem.text(clefChar[_this.clef]).font({
            family: 'akvo',
            size: 40
        });
        _this.clefSvg.move(_this.offset.x + clefOffset[_this.clef].x,
                           _this.offset.y + clefOffset[_this.clef].y);
    };
    this.drawKey = function(){
        for (var i = 0; i < _this.keySvg.length; i++){
            try{_this.keySvg[i].remove();}catch (e){}
        }

        // 升号调
        if (keySequence.sharpMajor.indexOf(_this.keySignature) !== -1){
            _this.keyNum = keySequence.sharpMajor.indexOf(_this.keySignature) + 1;
            for (var i = 0; i < _this.keyNum; i++){
                _this.keySvg[i]=(_this.svgItem.text(keyChar['sharp']).font({family: 'akvo', size:akvoSize}));
                _this.keySvg[i].move(_this.offset.x + clefWidth + i*keySpace,
                    _this.offset.y + nameToOffsetY(sharpNameSequence[i], keyChar['sharp']));
            }
        }
        if (keySequence.sharpMinor.indexOf(_this.keySignature) !== -1){
            _this.keyNum = keySequence.sharpMinor.indexOf(_this.keySignature) + 1;
            for (var i = 0; i < _this.keyNum; i++){
                _this.keySvg[i] = (_this.svgItem.text(keyChar['sharp']).font({family: 'akvo', size:akvoSize}));
                _this.keySvg[i].move(_this.offset.x + clefWidth + i*keySpace,
                    _this.offset.y + nameToOffsetY(sharpNameSequence[i], keyChar['sharp']));
            }
        }
        // 降号调
        if (keySequence.flatMajor.indexOf(_this.keySignature) !== -1){
            _this.keyNum = keySequence.flatMajor.indexOf(_this.keySignature) + 1;
            for (var i = 0; i < _this.keyNum; i++){
                _this.keySvg[i] = (_this.svgItem.text(keyChar['flat']).font({family: 'akvo', size:akvoSize}));
                _this.keySvg[i].move(_this.offset.x + clefWidth + i*keySpace,
                    _this.offset.y + nameToOffsetY(flatNameSequence[i], keyChar['flat']));
            }
        }
        if (keySequence.flatMinor.indexOf(_this.keySignature) !== -1){
            _this.keyNum = keySequence.flatMinor.indexOf(_this.keySignature) + 1;
            for (var i = 0; i < _this.keyNum; i++){
                _this.keySvg[i] = (_this.svgItem.text(keyChar['flat']).font({family: 'akvo', size:akvoSize}));
                _this.keySvg[i].move(_this.offset.x + clefWidth + i*keySpace,
                    _this.offset.y + nameToOffsetY(flatNameSequence[i], keyChar['flat']));
            }
        }

    };
    this.drawTime = function(timeSignature){
        if (timeSignature !== undefined){

            _this.timeSignature = {
                num: Number(timeSignature.substring(0, timeSignature.indexOf('/'))),
                unit: Number(timeSignature.substring(timeSignature.indexOf('/') + 1))
            };
        }
        try{_this.times[0].remove();}catch(e){}
        try{_this.times[1].remove();}catch(e){}
        _this.times[0] = _this.svgItem.text(_this.timeSignature.num.toString()).font({family: 'akvo', size: akvoSize});
        _this.times[0].move(_this.offset.x + clefWidth + _this.keyNum * keySpace + timeSpace, _this.offset.y + timeOffsetY.num);
        _this.times[1] = _this.svgItem.text(_this.timeSignature.unit.toString()).font({family: 'akvo', size: akvoSize});
        _this.times[1].move(_this.offset.x + clefWidth + _this.keyNum * keySpace + timeSpace, _this.offset.y + timeOffsetY.unit);

    };


    // init
    this.drawLines();
    this.drawClef();
    this.drawKey();

    this.headWidth = clefWidth + this.keyNum * keySpace + timeSpace;

    if (this.index === 0){
        if (currentPageIndex === 0){
            this.drawTime(timeSignature);
            this.headWidth += timeWidth;
        }
    }

    this.createBars();
    return this;
}

// 小节
function Bar(spage, svg, row, index, headWidth, maxDuration){
    var _this = this;

    this.spage = spage;
    this.svgItem = svg;
    this.row = row;
    this.index = index;
    this.barLength = (lineLength - headWidth) / barPerRow;
    this.offset = barIndexToOffset(row, this.index, headWidth, this.barLength);
    this.duration = 0;
    this.maxDuration = maxDuration;
    this.endLine = null;
    this.notes = [];
    this.noteTails = [];

    // format:
    // {rate: 4, name: ['f2', 'b2'], type: 'note', accidental: ['sharp', ''], dot: false}
    this.drawEndLine = function () {
        _this.endLine = _this.svgItem.line(_this.offset.x + _this.barLength - ((_this.index === barPerRow - 1) ? verticalEndLineWidth : verticalLineWidth)/2,
            _this.offset.y,
            _this.offset.x + _this.barLength - ((_this.index === barPerRow - 1) ? verticalEndLineWidth : verticalLineWidth)/2,
            _this.offset.y + (lineNum-1)*lineSpace)
            .stroke({
                width: (_this.index === barPerRow - 1) ? verticalEndLineWidth : verticalLineWidth,
                color: lineColor
            });
    };
    this.insertNote = function(index, name){
        if (_this.duration + 4 / operation.rate > _this.maxDuration){
            // 超过时值限制，添加失败
            return false;
        }
        _this.duration += 4 / operation.rate;
        var inputChar = itemToTextChar(name, operation.rate, operation.mode);


        _this.notes.splice(index, 0, new Note(
            _this.svgItem,
            operation.rate,
            operation.mode,
            inputChar,
            name,
            _this.offset,
            index,
            _this.noteSpace));

        _this.resetPosition();

        // 如果插在了连上的两个中间，断开连接
        for (var i = 0; i < _this.noteTails.length; i++){
            if ((_this.noteTails[i].end[0].index === index-1 && _this.noteTails[i].end[1].index === index+1) ||
                (_this.noteTails[i].end[0].index === index+1 && _this.noteTails[i].end[1].index === index-1)){
                _this.noteTails[i].destroy();
                _this.noteTails.splice(i, 1);
                break;
            }
        }

        if (isTailAvailable(_this.notes[index], _this.notes[index-1])){
            _this.noteTails.push(new Tail(_this.svgItem, _this.notes[index], _this.notes[index-1]));
        }
        else if (isTailAvailable(_this.notes[index], _this.notes[index+1])){
            _this.noteTails.push(new Tail(_this.svgItem, _this.notes[index], _this.notes[index+1]));
        }

        _this.resetTails();

        return true;
    };
    this.resetPosition = function () {
        _this.noteSpace = (_this.barLength - _this.notes.length*noteWidth) / (_this.notes.length+1);
        for (var i = 0; i < _this.notes.length; i++){
            _this.notes[i].update(i, _this.noteSpace);
        }
    };
    this.resetTails = function () {
        for (var i = 0; i < _this.noteTails.length; i++){
            _this.noteTails[i].update();
        }
    };
    this.raiseNote = function (index) {
        if (_this.notes[index].type !== 'note'){
            return;
        }
        _this.noteSpace = (_this.barLength - _this.notes.length*noteWidth) / (_this.notes.length+1);
        _this.notes[index].raise();
        for (var i = 0; i < _this.noteTails.length; i++){
            if (_this.noteTails[i].end[0].index === index || _this.noteTails[i].end[1].index === index){
                _this.noteTails[i].update();
                break;
            }
        }
        _this.notes[index].highlight();
    };
    this.fallNote = function (index) {
        if (_this.notes[index].type !== 'note'){
            return;
        }
        _this.noteSpace = (_this.barLength - _this.notes.length*noteWidth) / (_this.notes.length+1);
        _this.notes[index].fall();
        for (var i = 0; i < _this.noteTails.length; i++){
            if (_this.noteTails[i].end[0].index === index || _this.noteTails[i].end[1].index === index){
                _this.noteTails[i].update();
                break;
            }
        }
        _this.notes[index].highlight();
    };
    this.accidentalOperate = function (index, operator) {
        _this.notes[index].accidentalOperate(operator);
    };
    this.dotOperate = function (index) {
        // 符尾检查
        if (_this.notes[index].inTail === true){
            return;
        }
        // 时值检查
        if (_this.notes[index].dotStatus === false &&
            (2 / _this.notes[index].rate + _this.duration > _this.maxDuration)){
            return;
        }
        _this.duration += _this.notes[index].dotOperate();
    };
    this.deleteNote = function (index) {
        for (var i = 0; i < _this.noteTails.length; i++){
            if (_this.noteTails[i].end[0].index === index || _this.noteTails[i].end[1].index === index){
                _this.noteTails[i].destroy();
                _this.noteTails.splice(i, 1);
                break;
            }
        }
        _this.duration -= _this.notes[index].destroy();
        _this.notes.splice(index, 1);
        _this.resetPosition();
        _this.resetTails();
    };

    // init
    this.drawEndLine();
    return this;
}

// 音符
function Note(svg, rate, type, char, name, offset, index, noteSpace){
    var _this = this;

    this.svgItem = svg;
    this.rate = rate;
    this.type = type;
    this.char = char;
    this.name = name;
    this.obj = null;
    this.offset = offset;
    this.index = index;
    this.noteSpace = noteSpace;
    this.inTail = false;
    this.relatedTail = null;
    this.accidental = {
        type: '',
        obj: {}
    }; // 临时升降号
    this.dotStatus = false;
    this.legerLine = []; // 加线
    this.initText = function () {
        _this.obj = _this.svgItem.text(_this.char).font({
            family: 'akvo',
            size: akvoSize,
            style: noteColor
        });
    };
    this.update = function (index, noteSpace) {
        _this.index = index;
        _this.noteSpace = noteSpace;
        _this.moveText();
        if (_this.type === 'note'){
            _this.moveAccidental();
            _this.drawLegerLine();
        }

    };
    this.moveText = function () {
        _this.obj.move(_this.offset.x + _this.noteSpace * (_this.index+1) + noteWidth * _this.index - noteWidth/2,
            _this.offset.y + nameToOffsetY(_this.name, _this.char));
    };
    this.moveAccidental = function (){
        try {
            _this.accidental.obj.move(
                _this.offset.x + _this.noteSpace * (_this.index + 1) + noteWidth * _this.index - noteWidth / 2 + accidentalOffsetX[_this.accidental.type],
                _this.offset.y + nameToOffsetY(_this.name, keyChar[_this.accidental.type]));
        }catch (e){}
    };
    this.highlight = function () {
        _this.obj.fill({color: highlightColor});
        try{_this.accidental.obj.fill({color: highlightColor})}catch (e){}
    };
    this.cancelHighlight = function () {
        _this.obj.fill({color: noteColor});
        try{_this.accidental.obj.fill({color: noteColor})}catch (e){}
    };
    this.raise = function () {
        // 换符干方向
        _this.name = valueToNote(noteToValue(_this.name) + 1);
        if (_this.name === 'c2'){
            _this.char = _this.char.toLowerCase();
            _this.obj.remove();
            _this.initText();
            _this.highlight();
        }

        _this.moveText();
        _this.moveAccidental();

        // 更新加线
        _this.drawLegerLine();
    };
    this.fall = function () {
        _this.name = valueToNote(noteToValue(_this.name) - 1);
        if (_this.name === 'a1'){
            _this.char = _this.char.toUpperCase();
            _this.obj.remove();
            _this.initText();
            _this.highlight();
        }

        _this.moveText();
        _this.moveAccidental();


        // 更新加线
        _this.drawLegerLine();
    };
    this.drawLegerLine = function () {

        // 清空当前数组
        while(_this.legerLine.length > 0){
            _this.legerLine.shift().remove();
        }
        // 画新的
        // 如果在e1以下
        if (higherThan('e1', _this.name)){
            var num = parseInt(difference('e1', _this.name) / 2);
            for (var i = 0; i < num; i++){
                _this.legerLine[i] = _this.svgItem.text(legerLineChar).font({
                    family: 'akvo',
                    size: akvoSize,
                    style: noteColor
                });
                _this.legerLine[i].move(
                    _this.offset.x + _this.noteSpace * (_this.index+1) + noteWidth * _this.index - noteWidth/2 + legerLineOffsetX,
                    _this.offset.y + nameToOffsetY('e1', legerLineChar) + (i+1)*lineSpace);
            }
        }
        if (higherThan(_this.name, 'f2')){
            var num = parseInt(difference(_this.name, 'f2') / 2);
            for (var i = 0; i < num; i++){
                _this.legerLine[i] = _this.svgItem.text(legerLineChar).font({
                    family: 'akvo',
                    size: akvoSize,
                    style: noteColor
                });
                _this.legerLine[i].move(
                    _this.offset.x + _this.noteSpace * (_this.index+1) + noteWidth * _this.index - noteWidth/2 + legerLineOffsetX,
                    _this.offset.y + nameToOffsetY('f2', legerLineChar) - (i+1)*lineSpace);
            }
        }
    };
    this.accidentalOperate = function (operator) {

        _this.accidental.type = operator;
        if (typeof _this.accidental.obj.remove !== 'undefined'){
            _this.accidental.obj.remove();
        }
        if (operator === ''){
            return;
        }
        _this.accidental.obj = _this.svgItem.text(keyChar[_this.accidental.type]).font({
            family: 'akvo',
            size: akvoSize,
            style: noteColor
        });
        _this.accidental.obj.move(
            _this.offset.x + _this.noteSpace * (_this.index+1) + noteWidth * _this.index - noteWidth/2 + accidentalOffsetX[_this.accidental.type],
            _this.offset.y + nameToOffsetY(_this.name, keyChar[_this.accidental.type]));
        _this.accidental.obj.fill({color: highlightColor});
    };
    this.dotOperate = function () {
        // 添加或删除附点不会改变当前音符里的这个rate值

        // 如果是添加，在小节处已经判断过时值有没有超
        // 添加
        if (_this.dotStatus === false){
            // 时值
             _this.dotStatus = true;
            _this.resetChar(charToDotChar(_this.char));
            _this.highlight();

            return 2 / _this.rate;
        }
        // 删除
        else{
            _this.dotStatus = false;
            _this.resetChar(dotCharToChar(_this.char));
            _this.highlight();

            return -2 / _this.rate;
        }
    };
    this.destroy = function () {

        _this.obj.remove();
        try{_this.accidental.obj.remove()}catch (e){}
        for (var i = 0; i < _this.legerLine.length; i++){
            _this.legerLine[i].remove();
        }

        return (_this.dotStatus === true) ? (6 / _this.rate) : (4 / _this.rate);
    };
    this.resetChar = function (char) {
        _this.char = char;
        _this.obj.remove();
        _this.initText();
        _this.moveText();
    };

    this.initText();
    if (this.type === 'note'){
        this.drawLegerLine();
    }
    return this;
}

// 光标
function Cursor(spage, row, bar, index){
    var _this = this;

    this.spage = spage;
    this.svgItem = spage.svgItem;
    this.row = row;
    this.bar = bar;
    this.barObj = this.spage.rows[this.row].bars[this.bar];
    this.index = index;
    this.offset = this.spage.rows[this.row].bars[this.bar].offset;
    this.line = this.svgItem.line(this.offset.x, this.offset.y, this.offset.x, this.offset.y + lineSpace*(lineNum-1))
        .stroke({
            width: 2,
            color: cursorColor
        });
    this.highlightNote = function () {
        if (_this.index !== 0){
            _this.barObj.notes[_this.index-1].highlight();
        }
    };
    this.cancelHighlightNote = function () {
        if (_this.index !== 0){
            _this.barObj.notes[_this.index-1].cancelHighlight();
        }
    };
    this.update = function (){
        // 把之前的那个音符涂回黑色


        // 更新位置
        this.barObj = this.spage.rows[this.row].bars[this.bar];
        this.offset = this.barObj.offset;
        var noteSpace = (_this.barObj.barLength - _this.barObj.notes.length*noteWidth) / (_this.barObj.notes.length+1);
        _this.line.move(_this.offset.x + noteSpace * (_this.index) + noteWidth * _this.index,// - noteWidth/2,
                        _this.offset.y,
                        _this.offset.x + noteSpace * (_this.index) + noteWidth * _this.index,// - noteWidth/2,
                        _this.offset.y + lineSpace*(lineNum-1));
    };

    // init
    return this;
}

// 符尾
function Tail(svg, note1, note2){
    // 默认note1和note2都是note类型的，类型会在创建时便判断好
    var _this = this;

    this.svgItem = svg;
    this.end = [note1, note2];
    this.stemDown = (_this.end[0].char === _this.end[0].char.toLowerCase() &&
                     _this.end[1].char === _this.end[1].char.toLowerCase());
    this.tails = [];
    this.getTailPos = function (char0, char1) {
        _this.tailPos = [
            {
                x: _this.end[0].offset.x + _this.end[0].noteSpace * (_this.end[0].index+1) + noteWidth * _this.end[0].index - noteWidth/2 + tailOffset[char0].x,
                y: _this.end[0].offset.y + nameToOffsetY(_this.end[0].name, _this.end[0].char) + tailOffset[char0].y
            },
            {
                x: _this.end[1].offset.x + _this.end[1].noteSpace * (_this.end[1].index+1) + noteWidth * _this.end[1].index - noteWidth/2 + tailOffset[char1].x,
                y: _this.end[1].offset.y + nameToOffsetY(_this.end[1].name, _this.end[1].char) + tailOffset[char1].y
            }
        ];
    };
    this.addTail = function () {
        var tailPath;
        var pathObj;

        if (_this.end[0].rate === 8 && _this.end[1].rate === 8){

            _this.end[0].resetChar(_this.stemDown ? 'c' : 'C');
            _this.end[1].resetChar(_this.stemDown ? 'c' : 'C');
            _this.getTailPos(_this.stemDown ? 'c' : 'C', _this.stemDown ? 'c' : 'C');

            tailPath = new SVG.PathArray([
                ['M', _this.tailPos[0].x, _this.tailPos[0].y],
                ['L', _this.tailPos[1].x, _this.tailPos[1].y],
                ['L', _this.tailPos[1].x, _this.tailPos[1].y + (_this.stemDown ? (-1) : 1)*tailWidth],
                ['L', _this.tailPos[0].x, _this.tailPos[0].y + (_this.stemDown ? (-1) : 1)*tailWidth],
                ['Z']
            ]);
            pathObj = _this.svgItem.path(tailPath);
            pathObj.fill({color: noteColor});
            pathObj.stroke({width: 0});
            _this.tails.push(pathObj);
        }
        else if (_this.end[0].rate === 16 && _this.end[1].rate === 16){
            _this.end[0].resetChar(_this.stemDown ? 'c' : 'C');
            _this.end[1].resetChar(_this.stemDown ? 'c' : 'C');
            _this.getTailPos(_this.stemDown ? 'c' : 'C', _this.stemDown ? 'c' : 'C');

            // 第一条
            tailPath = new SVG.PathArray([
                ['M', _this.tailPos[0].x, _this.tailPos[0].y],
                ['L', _this.tailPos[1].x, _this.tailPos[1].y],
                ['L', _this.tailPos[1].x, _this.tailPos[1].y + (_this.stemDown ? (-1) : 1)*tailWidth],
                ['L', _this.tailPos[0].x, _this.tailPos[0].y + (_this.stemDown ? (-1) : 1)*tailWidth],
                ['Z']
            ]);
            pathObj = _this.svgItem.path(tailPath);
            pathObj.fill({color: noteColor});
            pathObj.stroke({width: 0});
            _this.tails.push(pathObj);

            // 第二条
            tailPath = new SVG.PathArray([
                ['M', _this.tailPos[0].x, _this.tailPos[0].y + (_this.stemDown ? (-1) : 1)*tailWidth*2],
                ['L', _this.tailPos[1].x, _this.tailPos[1].y + (_this.stemDown ? (-1) : 1)*tailWidth*2],
                ['L', _this.tailPos[1].x, _this.tailPos[1].y + (_this.stemDown ? (-1) : 1)*tailWidth*3],
                ['L', _this.tailPos[0].x, _this.tailPos[0].y + (_this.stemDown ? (-1) : 1)*tailWidth*3],
                ['Z']
            ]);
            pathObj = _this.svgItem.path(tailPath);
            pathObj.fill({color: noteColor});
            pathObj.stroke({width: 0});
            _this.tails.push(pathObj);
        }
        else if (_this.end[0].rate === 32 && _this.end[1].rate === 32){
            _this.end[0].resetChar(_this.stemDown ? 'c' : 'C');
            _this.end[1].resetChar(_this.stemDown ? 'c' : 'C');
            _this.getTailPos(_this.stemDown ? 'c' : 'C', _this.stemDown ? 'c' : 'C');

            // 第一条
            tailPath = new SVG.PathArray([
                ['M', _this.tailPos[0].x, _this.tailPos[0].y],
                ['L', _this.tailPos[1].x, _this.tailPos[1].y],
                ['L', _this.tailPos[1].x, _this.tailPos[1].y + (_this.stemDown ? (-1) : 1)*tailWidth],
                ['L', _this.tailPos[0].x, _this.tailPos[0].y + (_this.stemDown ? (-1) : 1)*tailWidth],
                ['Z']
            ]);
            pathObj = _this.svgItem.path(tailPath);
            pathObj.fill({color: noteColor});
            pathObj.stroke({width: 0});
            _this.tails.push(pathObj);

            // 第二条
            tailPath = new SVG.PathArray([
                ['M', _this.tailPos[0].x, _this.tailPos[0].y + (_this.stemDown ? (-1) : 1)*tailWidth*2],
                ['L', _this.tailPos[1].x, _this.tailPos[1].y + (_this.stemDown ? (-1) : 1)*tailWidth*2],
                ['L', _this.tailPos[1].x, _this.tailPos[1].y + (_this.stemDown ? (-1) : 1)*tailWidth*3],
                ['L', _this.tailPos[0].x, _this.tailPos[0].y + (_this.stemDown ? (-1) : 1)*tailWidth*3],
                ['Z']
            ]);
            pathObj = _this.svgItem.path(tailPath);
            pathObj.fill({color: noteColor});
            pathObj.stroke({width: 0});
            _this.tails.push(pathObj);

            // 第三条
            tailPath = new SVG.PathArray([
                ['M', _this.tailPos[0].x, _this.tailPos[0].y + (_this.stemDown ? (-1) : 1)*tailWidth*4],
                ['L', _this.tailPos[1].x, _this.tailPos[1].y + (_this.stemDown ? (-1) : 1)*tailWidth*4],
                ['L', _this.tailPos[1].x, _this.tailPos[1].y + (_this.stemDown ? (-1) : 1)*tailWidth*5],
                ['L', _this.tailPos[0].x, _this.tailPos[0].y + (_this.stemDown ? (-1) : 1)*tailWidth*5],
                ['Z']
            ]);
            pathObj = _this.svgItem.path(tailPath);
            pathObj.fill({color: noteColor});
            pathObj.stroke({width: 0});
            _this.tails.push(pathObj);
        }
        else if ((_this.end[0].rate === 8 && _this.end[1].rate === 16 && _this.end[0].dotStatus === true) ||
                 (_this.end[0].rate === 16 && _this.end[1].rate === 8 && _this.end[1].dotStatus === true)){

            var is0Dot = (_this.end[0].rate < _this.end[1].rate);
            if (is0Dot){
                _this.end[0].resetChar(_this.stemDown ? 'i' : 'I');
                _this.end[1].resetChar(_this.stemDown ? 'c' : 'C');
                _this.getTailPos(_this.stemDown ? 'i' : 'I', _this.stemDown ? 'c' : 'C');
            }
            else {
                _this.end[0].resetChar(_this.stemDown ? 'c' : 'C');
                _this.end[1].resetChar(_this.stemDown ? 'i' : 'I');
                _this.getTailPos(_this.stemDown ? 'c' : 'C', _this.stemDown ? 'i' : 'I');
            }

            // 第一条
            tailPath = new SVG.PathArray([
                ['M', _this.tailPos[0].x, _this.tailPos[0].y],
                ['L', _this.tailPos[1].x, _this.tailPos[1].y],
                ['L', _this.tailPos[1].x, _this.tailPos[1].y + (_this.stemDown ? (-1) : 1)*tailWidth],
                ['L', _this.tailPos[0].x, _this.tailPos[0].y + (_this.stemDown ? (-1) : 1)*tailWidth],
                ['Z']
            ]);
            pathObj = _this.svgItem.path(tailPath);
            pathObj.fill({color: noteColor});
            pathObj.stroke({width: 0});
            _this.tails.push(pathObj);

            // 第二条
            tailPath = new SVG.PathArray([
                ['M', (_this.tailPos[0].x + _this.tailPos[1].x)/2, (_this.tailPos[0].y + _this.tailPos[1].y)/2 + (_this.stemDown ? (-1) : 1)*tailWidth*2],
                ['L', (_this.tailPos[0].x + _this.tailPos[1].x)/2, (_this.tailPos[0].y + _this.tailPos[1].y)/2 + (_this.stemDown ? (-1) : 1)*tailWidth*3],
                ['L', is0Dot ? _this.tailPos[1].x : _this.tailPos[0].x, (is0Dot ? _this.tailPos[1].y : _this.tailPos[0].y) + (_this.stemDown ? (-1) : 1)*tailWidth*3],
                ['L', is0Dot ? _this.tailPos[1].x : _this.tailPos[0].x, (is0Dot ? _this.tailPos[1].y : _this.tailPos[0].y) + (_this.stemDown ? (-1) : 1)*tailWidth*2],
                ['Z']
            ]);
            pathObj = _this.svgItem.path(tailPath);
            pathObj.fill({color: noteColor});
            pathObj.stroke({width: 0});
            _this.tails.push(pathObj);
        }
        else if ((_this.end[0].rate === 16 && _this.end[1].rate === 32 && _this.end[0].dotStatus === true) ||
                 (_this.end[0].rate === 32 && _this.end[1].rate === 16 && _this.end[1].dotStatus === true)){
            var is0Dot = (_this.end[0].rate < _this.end[1].rate);
            if (is0Dot){
                _this.end[0].resetChar(_this.stemDown ? 'i' : 'I');
                _this.end[1].resetChar(_this.stemDown ? 'c' : 'C');
                _this.getTailPos(_this.stemDown ? 'i' : 'I', _this.stemDown ? 'c' : 'C');
            }
            else {
                _this.end[0].resetChar(_this.stemDown ? 'c' : 'C');
                _this.end[1].resetChar(_this.stemDown ? 'i' : 'I');
                _this.getTailPos(_this.stemDown ? 'c' : 'C', _this.stemDown ? 'i' : 'I');
            }

            // 第一条
            tailPath = new SVG.PathArray([
                ['M', _this.tailPos[0].x, _this.tailPos[0].y],
                ['L', _this.tailPos[1].x, _this.tailPos[1].y],
                ['L', _this.tailPos[1].x, _this.tailPos[1].y + (_this.stemDown ? (-1) : 1)*tailWidth],
                ['L', _this.tailPos[0].x, _this.tailPos[0].y + (_this.stemDown ? (-1) : 1)*tailWidth],
                ['Z']
            ]);
            pathObj = _this.svgItem.path(tailPath);
            pathObj.fill({color: noteColor});
            pathObj.stroke({width: 0});
            _this.tails.push(pathObj);

            // 第二条
            tailPath = new SVG.PathArray([
                ['M', _this.tailPos[0].x, _this.tailPos[0].y + (_this.stemDown ? (-1) : 1)*tailWidth*2],
                ['L', _this.tailPos[1].x, _this.tailPos[1].y + (_this.stemDown ? (-1) : 1)*tailWidth*2],
                ['L', _this.tailPos[1].x, _this.tailPos[1].y + (_this.stemDown ? (-1) : 1)*tailWidth*3],
                ['L', _this.tailPos[0].x, _this.tailPos[0].y + (_this.stemDown ? (-1) : 1)*tailWidth*3],
                ['Z']
            ]);
            pathObj = _this.svgItem.path(tailPath);
            pathObj.fill({color: noteColor});
            pathObj.stroke({width: 0});
            _this.tails.push(pathObj);

            // 第三条
            tailPath = new SVG.PathArray([
                ['M', (_this.tailPos[0].x + _this.tailPos[1].x)/2, (_this.tailPos[0].y + _this.tailPos[1].y)/2 + (_this.stemDown ? (-1) : 1)*tailWidth*4],
                ['L', (_this.tailPos[0].x + _this.tailPos[1].x)/2, (_this.tailPos[0].y + _this.tailPos[1].y)/2 + (_this.stemDown ? (-1) : 1)*tailWidth*5],
                ['L', is0Dot ? _this.tailPos[1].x : _this.tailPos[0].x, (is0Dot ? _this.tailPos[1].y : _this.tailPos[0].y) + (_this.stemDown ? (-1) : 1)*tailWidth*5],
                ['L', is0Dot ? _this.tailPos[1].x : _this.tailPos[0].x, (is0Dot ? _this.tailPos[1].y : _this.tailPos[0].y) + (_this.stemDown ? (-1) : 1)*tailWidth*4],
                ['Z']
            ]);
            pathObj = _this.svgItem.path(tailPath);
            pathObj.fill({color: noteColor});
            pathObj.stroke({width: 0});
            _this.tails.push(pathObj);
        }
    };
    this.update = function () {
        _this.stemDown = (_this.end[0].char === _this.end[0].char.toLowerCase() &&
                          _this.end[1].char === _this.end[1].char.toLowerCase());
        while(_this.tails.length > 0){
            _this.tails.shift().remove();
        }
        _this.addTail();
    };
    this.destroy = function () {
        while(_this.tails.length > 0){
            _this.tails.shift().remove();
        }
        for (var i = 0; i < _this.end.length; i++){
            if (_this.end[i].dotStatus === true){
                _this.end[i].resetChar(charToDotChar(noteChar[_this.end[i].rate.toString()]));
            }
            else{
                _this.end[i].resetChar(noteChar[_this.end[i].rate.toString()]);
            }
        }
        _this.end[0].inTail = false;
        _this.end[0].relatedTail = undefined;
        _this.end[1].inTail = false;
        _this.end[1].relatedTail = undefined;
    };

    this.addTail();
    this.end[0].inTail = true;
    this.end[1].inTail = true;
    this.end[0].relatedTail = this;
    this.end[1].relatedTail = this;


    return this;
}
