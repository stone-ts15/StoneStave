/**
 * Created by lenovo on 2017/7/25.
 */


// object
// stave
var music = [];
var page;
var currentPageIndex = 0;
var pageSize = {
    x: 840,
    y: 1188
};
var pageIndexOffset = {
    x: -10,
    y: -100
};

var pageWidth = 840;
var pageHeight = 1188;

var pageDom;
var pageProportionX = 0.9;
var pageProportionY = 0.9;

var pageOffset = {x: 60, y: 200};
var normalPageOffset = {x: 60, y: 80};

var lineSpace = 10;
var lineLength = pageWidth - 2*pageOffset.x;
var lineColor = '#000000';

var rowSpace = 80;

var akvoFont;

const lineNum = 5;



var barPerRow = 3;
var clefWidth = 40;
var keyWidth = 80;
var timeWidth = 30;
var timeSpace = 15;

var barLengthOrigin = (lineLength - clefWidth - keyWidth) / barPerRow;

var horizontalLineWidth = 1;
var verticalLineWidth = 2;
var verticalEndLineWidth = 4;

var clefOffset = {
    'G': {x: 0, y: -24},
    'F': {x: 0, y: -24}
};

var timeOffsetY = {
    num: -40,
    unit: -20
};

var clefChar = {
    'G': '$',
    'F': '#'
};

var keyChar = {
    'sharp': '-',
    'flat': '.',
    'nature': '/'
};

// var nameSequence = [4, 1, 5, 2, 6, 3, 7];
var sharpNameSequence = ['f2', 'c2', 'g2', 'd2', 'a1', 'e2', 'b1'];
var flatNameSequence = ['b1', 'e2', 'a1', 'd2', 'g1', 'c2', 'f1'];
var keySequence = {
    sharpMajor: ['G', 'D', 'A', 'E', 'B', 'F-sharp', 'C-sharp'],
    sharpMinor: ['e', 'b', 'f-sharp', 'c-sharp', 'g-sharp', 'd-sharp', 'a-sharp'],
    flatMajor : ['F', 'B-flat', 'E-flat', 'A-flat', 'D-flat', 'G-flat', 'C-flat'],
    flatMinor : ['d', 'g', 'c', 'f', 'b-flat', 'e-flat', 'a-flat'],
    nature: ['C']
};

var keySpace = 7;


var cursorColor = '#ff3333';

var cursorPos = {
    line: null,
    row: 0,
    bar: 0,
    index: 0
};

// 当前选中的操作
var operation = {
    mode: 'note',
    rate: 4
};

var noteChar = {
    '1': 'a',
    '2': 'b',
    '4': 'c',
    '8': 'd',
    '16': 'e',
    '32': 'f'
};

var restChar = {
    '1': 'O',
    '2': 'P',
    '4': 'Q',
    '8': 'R',
    '16': 'S',
    '32': 'T'
};

var noteWidth = 10;

var akvoSize = 36;

var c;

var highlightColor = '#ff5500';
var noteColor = '#000000';

var legerLineChar = '&';
var legerLineOffsetX = -4;
var accidentalOffsetX = {
    'sharp': -8,
    'flat': -7,
    'nature': -8
};

var tailWidth = 4;
var tailOffset = {
    'c': {x: 0, y: 85},
    'i': {x: 0, y: 85},
    'C': {x: 10, y: 20},
    'I': {x: 10, y: 20}
};

var inSet = false;

var pianoDom;
var averageDuration;
