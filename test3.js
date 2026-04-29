const fs = require('fs');
const m = require('pdf-parse');
async function test() {
  try {
    const parser = new m.PDFParse();
    console.log("Instantiated.");
  } catch (e) {
    console.error(e);
  }
}
test();
