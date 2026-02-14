// Shim to re-export jsPDF as default for CJS compatibility
const jspdf = require('jspdf');
module.exports = jspdf.jsPDF;
module.exports.default = jspdf.jsPDF;
