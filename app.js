const gulp = require('gulp');
const concat = require('gulp-concat');
const svgmin = require('gulp-svgmin');
const through2 = require('through2');
const cheerio = require('cheerio');
const readline = require('readline');
const fs = require('fs');
const { JSDOM } = require('jsdom');
const glob = require('glob');
let filepathString =''

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
const c = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  underline: '\x1b[4m',
  blink: '\x1b[5m',
  invert: '\x1b[7m'
};


function setSize(parent, frames) {
  console.log(c.cyan+'...fixing sizes')
  parent.setAttribute('width', frames[0].getAttribute('width'));
  parent.setAttribute('height', frames[0].getAttribute('height'));
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
    const isUrlFormat = attrValue.startsWith('url(') && attrValue.endsWith(')');
    const extractedID = isUrlFormat ? attrValue.slice(4, -1) : attrValue;

    if (extractedID === oldID) {
      const newAttrValue = isUrlFormat ? `url(${newID})` : newID ;
      el.setAttribute(attr, newAttrValue);
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
async function waitForFileToExist(filePath) {
  // Check if the file exists
  if (fs.existsSync(filePath)) {
    return;
  }

  // If the file doesn't exist yet, wait 100ms and check again
  await new Promise((resolve) => setTimeout(resolve, 100));
  await waitForFileToExist(filePath);
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

async function Init({ filePath }) {
  console.log(` ${c.bold+c.red}DONT CLOSE!${c.reset}
  ${c.cyan}...Compiling files
  ...Generating svg file to ${c.magenta}${filePath}`)
  await waitForFileToExist(filePath);
  
  const file = fs.readFileSync(filePath, 'utf-8');
  const { document } = new JSDOM(file).window;
  const parent = document.querySelector('svg');
  const frames = Array.from(document.querySelectorAll('svg > svg'));
 


  setSize(parent,frames)
  console.log(`${c.cyan}...Resolving ID conflicts`)
  
  frames.forEach((frame, i) => {
    fixIDs(frame, i);
    frame.setAttribute('display', 'none');
  });

  const output = parent.outerHTML;
  fs.writeFileSync(filePath, output);
  console.log(`
  ${c.bold+c.green}COMPLETED! 
  ${c.reset}Your ${c.bold+c.cyan}SVGAlive ${c.reset} are now compiled in ${c.magenta+filePath}
          `);
  rl.question(`
-- ${c.yellow}Close session Y/N? ${c.reset} (default N) : 
`, (close = 'n') => {
    close.toLowerCase() !== 'y' && (close = 'n');
    close.toLowerCase() === 'n' ? createAnimation() : rl.close();
  })
}





const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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

function createScript({ sources, output, destiny }) {
  return gulp
    .src(sources)
    .pipe(concat(output))
    .pipe(gulp.dest(destiny))
}

async function createAnimation() {
  console.log(`\x1b[36m \x1b[2mSVGALive! \x1b[37mNEW OPERATION:`)
  rl.question('-- \x1b[33mSources(frames) folder name\x1b[37m(or default)?  : ', (frames) => {
    rl.question('-- \x1b[33mAnimation(output file) name \x1b[37m(optional) ?  : ', (name) => {
      rl.question('-- \x1b[33mDestiny folder Name \x1b[37m(optional) ? : ', (destiny) => {
        const baseDestiny = `./SVGAlive/sources/${destiny ? `${ destiny }/` : ''}`;
        const outputSVG = `${name ||  frames || 'nameless-anim'}.svg`;
        const finalOutput = getAvailableFilename(baseDestiny,outputSVG)
        const sources = glob.sync(`./src/${frames || ''}/*.svg`);
        if (sources.length === 0) {
          console.log(`\x1b[31m ERROR: No SVG files found in \x1b[35m'./src/${frames? frames : ''}'`);
          console.log('\x1b[37m check if your files exist in the folder or check the folder name you provided and try again')
          rl.question(`
-- \x1b[33m Try Again Y/N? \x1b[37m (default Y) : 
`, (close = 'n') => {
            close.toLowerCase() !== 'n' && (close = 'y');
            close.toLowerCase() === 'y' ? createAnimation() : rl.close();
          })
        }else{
          createSVG({
          sources,
          output: finalOutput,
          destiny: baseDestiny,
        });
        filepathString = `${baseDestiny}${finalOutput}`;       
        Init({filePath:filepathString});
        }


      });
    });
  });
}

createAnimation();


