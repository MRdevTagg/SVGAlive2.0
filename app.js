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

function setSize(parent, frames) {
  console.log('\x1b[34m...fixing sizes')
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
  if (el.getAttribute(attr) === oldID) {
    el.setAttribute(attr, newID);
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
    childs.forEach(ch => {
      idMatch(ch, `#${oldID}`, `#${newID}`, 'xlink:href');
      idMatch(ch, `url(#${oldID})`, `url(#${newID})`, 'fill');
      idMatch(ch, `url(#${oldID})`, `url(#${newID})`, 'filter');
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
    const basename = filename.slice(0, filename.lastIndexOf('.'));
    filename = `${basename}(${index})${extension}`;
  }
  
  return filename;
}

async function Init({ filePath, w = null, }) {
  console.log('  \x1b[31mDONT CLOSE!')
  console.log(`\x1b[34m...Compiling files`)
  console.log(`\x1b[34m...Generating svg file to \x1b[35m${filePath}`)
  await waitForFileToExist(filePath);
  
  const file = fs.readFileSync(filePath, 'utf-8');
  const { document } = new JSDOM(file).window;
  const parent = document.querySelector('svg');
  const frames = Array.from(document.querySelectorAll('svg > svg'));
 
console.log('\x1b[34m...Resolving ID conflicts')
console.log(' ')

setSize(parent,frames)
  frames.forEach((frame, i) => {
    fixIDs(frame, i);
    if (i !== 0) {
      frame.setAttribute('display', 'none');
    }
  });

  const output = parent.outerHTML;
  fs.writeFileSync(filePath, output);
  console.log(`
  \x1b[32mCOMPLETED! 
  \x1b[37mYour \x1b[3mSVGAlive \x1b[37m are now compiled in \x1b[35m${filePath}
          `);
  rl.question(`
-- \x1b[33mClose session Y/N? \x1b[37m (default N) : 
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


