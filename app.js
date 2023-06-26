const gulp = require('gulp');
const concat = require('gulp-concat');
const svgmin = require('gulp-svgmin');
const through2 = require('through2');
const cheerio = require('cheerio');
const readline = require('readline');
const fs = require('fs');
const { JSDOM } = require('jsdom');
const glob = require('glob');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let fixedids = 0; // to track ammount of fixed IDs
const attrs = [
  'clip-path',
  'filter',
  'mask',
  'fill',
  'stroke',
  'marker-start',
  'marker-mid',
  'marker-end',
  'xlink:href',
  'href',
  'begin',
  'end',
  'from',
  'to',
  'by',
  'values',
  'in',
  'in2',
  'result',
  'patternContentUnits',
  'patternUnits',
  'gradientUnits',
  'spreadMethod',
  'gradientTransform',
  'xlink:arcrole',
  'xlink:role',
  'xlink:title',
  'xlink:show',
  'xlink:actuate',
  'xlink:type',
  'xlink:hreflang',
  'xlink:group',
  'xlink:space',
  'xlink:availability',
  'xlink:controlledBy',
  'xlink:controller',
  'xlink:dateTime',
  'xlink:enter',
  'xlink:exit',
  'xlink:label',
  'xlink:parent',
  'xlink:path',
  'xlink:port',
  'xlink:server',
  'xlink:signature',
  'xlink:verifier'
];
const ansi = (color)=>{
  const colors ={
  red: '\x1b[31m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  underline: '\x1b[4m',
  blink: '\x1b[5m',
  invert: '\x1b[7m'
};
return typeof color === 'string' ? colors[color] : color.map(c => colors[c])
}


function setSize(parent, frames) {
  console.log(ansi('cyan') + '...fixing sizes');
  parent.setAttribute('width', frames[0].getAttribute('width'));
  parent.setAttribute('height', frames[0].getAttribute('height'));
  parent.setAttribute('viewBox', `0 0 ${frames[0].getAttribute('width')} ${frames[0].getAttribute('height')}`);
  parent.setAttribute('preserveAspectRatio', 'xMinYMin meet');
  parent.style.width = '100%';
  parent.style.height = 'auto';
  frames.forEach((frame) => {
    frame.style.width = '100%';
    frame.style.height = 'auto';
    frame.setAttribute('viewBox', `0 0 ${frame.getAttribute('width')} ${frame.getAttribute('height')}`);
    frame.setAttribute('preserveAspectRatio', 'xMinYMin meet');
    frame.removeAttribute('width');
    frame.removeAttribute('height');
  });
}
function idMatch(el, oldID, newID, attr) {
  const attrValue = el.getAttribute(attr);
  if (attrValue) {
    const isUrl = attrValue.startsWith('url(') && attrValue.endsWith(')');
    const cleanID = isUrl ? attrValue.slice(4, -1) : attrValue;
    if (cleanID === oldID) {
      fixedids += 1;
      const finalID = isUrl ? `url(${newID})` : newID ;
      el.setAttribute(attr, finalID);
    }
  }
}
async function fixIDs(frame, i) {
  frame.setAttribute('id', `frame_${i + 1}`);
  const childs = frame.querySelectorAll('*');
  const ids = frame.querySelectorAll('[id]');
  let oldID, newID;
  ids.forEach((id, j) => {
    oldID = id.id;
    newID = `${id.id + '_' + i + '_' + j}`;
    id.id !== '' && id.setAttribute('id', newID);
    childs.forEach(child => {
      attrs.forEach(attr => 
      idMatch(child, `#${oldID}`, `#${newID}`, attr))
    });
  });
}
function getAvailableFilename(filepath, filename) {
  let index = 0;
  
  while (fs.existsSync(filepath + filename)) {
    index++;
    const extension = filename.slice(filename.lastIndexOf('.'));
    const basename = filename.slice(0, filename.includes('(') ? filename.lastIndexOf('(') : filename.lastIndexOf('.'));
    filename = `${basename}(${index})${extension}`;
  } 
  return filename;
}
async function waitForFileToExist(filePath) {
  if (fs.existsSync(filePath)) return;
  await new Promise((resolve) => setTimeout(resolve, 100));
  await waitForFileToExist(filePath);
}
async function Init(filePath) {
  console.log(` ${ansi('bold','red')}DONT CLOSE!${ansi('reset')}
${ansi('cyan')}...Compiling files
...Generating svg file to ${ansi('magenta')}${filePath}`)
  await waitForFileToExist(filePath);
  console.log(`${ansi('cyan')}...Re-opening file to fix IDs and sizes`)
  const file = fs.readFileSync(filePath, 'utf-8');
  const { document } = new JSDOM(file).window;
  const parent = document.querySelector('svg');
  const frames = Array.from(document.querySelectorAll('svg > svg'));
 
  setSize(parent,frames)

  console.log(`${ansi('cyan')}...Making svg responsive
...Resolving ID conflicts`)
  
  frames.forEach((frame, i) => {
    fixIDs(frame, i);
    frame.setAttribute('display', 'none');
  });

  const output = parent.outerHTML;
  fs.writeFileSync(filePath, output);
  console.log(`\n  ${ansi('bold','green')}COMPLETED! 
  ${ansi('reset')}Your ${ansi('bold','cyan')}AliveSVG ${ansi('reset')}.svg file are now ready to use in ${ansi('magenta')+filePath}
  ${ansi('yellow')}Total compiled frames: ${frames.length}
  ${ansi('yellow')}Total IDs fixed: ${fixedids}\n`);
  fixedids = 0
  rl.question(`
-- ${ansi('yellow')}Close session Y/N? ${ansi('reset')} (default N) : 
`, (close = 'n') => {
    close.toLowerCase() !== 'y' && (close = 'n');
    close.toLowerCase() === 'n' ? createAliveSVG() : rl.close();
  })
}
function createSVG({ sources, output, destiny}) {

  return gulp
    .src(sources)
    .pipe(svgmin())
    .pipe(concat(output))
    .pipe(
    through2.obj(function (file, encoding, cb) {
        const $ = cheerio.load(file.contents.toString(), { xmlMode: true });
        $('svg').wrapAll('<svg xmlns="http://www.w3.org/2000/svg" externalResourcesRequired="true"></svg>');
        file.contents = Buffer.from($.html());
        cb(null, file);
      })
    )
    .pipe(gulp.dest(destiny))
}

async function createAliveSVG() {
  console.log(`${ansi('cyan')} AliveSVG! ${ansi('white')}NEW OPERATION:`)
  rl.question(`-- ${ansi('yellow')}Sources(frames) folder name${ansi('white')}(or default)?  : `, (frames) => {
    rl.question(`-- ${ansi('yellow')}Animation(output file) name ${ansi('white')}(optional) ?  : `, (name) => {
      rl.question(`-- ${ansi('yellow')}Destiny folder Name ${ansi('white')}(optional) ? : `, (destiny) => {
        const baseDestiny = `./AliveSVG/sources/${destiny ? `${ destiny }/` : ''}`;
        const outputSVG = `${name ||  frames || 'nameless-anim'}.svg`;
        const fileName = getAvailableFilename(baseDestiny,outputSVG)
        const sources = glob.sync(`./src/${frames || ''}/*.svg`);
        if (sources.length === 0) {
          console.log(`${ansi('red')} ERROR: No SVG files found in ${ansi('magenta')}'./src/${frames? frames : ''}'`);
          console.log(`${ansi('white')} check if your files exist in the folder or check the folder name you provided and try again`)
          rl.question(`\n-- ${ansi('yellow')} Try Again Y/N? ${ansi('white')} (default Y) :`, (close = 'n') => {
            close.toLowerCase() !== 'n' && (close = 'y');
            close.toLowerCase() === 'y' ? createAliveSVG() : rl.close();
          })
        }else{
          createSVG({
          sources,
          output: fileName,
          destiny: baseDestiny,
        });             
        Init(`${baseDestiny}${fileName}`);
        }
      });
    });
  });
}

createAliveSVG();


