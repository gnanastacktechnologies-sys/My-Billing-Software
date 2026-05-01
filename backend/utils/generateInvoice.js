const PDFDocument = require('pdfkit');
const cloudinary = require('../config/cloudinary');
const streamBuffers = require('stream-buffers');

const generateInvoicePDF = (project, invoiceNo) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const myWritableStreamBuffer = new streamBuffers.WritableStreamBuffer({
      initialSize: (100 * 1024),   // start at 100 kilobytes.
      incrementAmount: (10 * 1024) // grow by 10 kilobytes each time buffer overflows.
    });

    doc.pipe(myWritableStreamBuffer);

    // Invoice Header
    doc.fontSize(20).text('INVOICE', { align: 'center' });
    doc.moveDown();
    
    // Company details
    doc.fontSize(12).text('GnanaStack Technologies', { align: 'right' });
    doc.text('Project-Based Billing System', { align: 'right' });
    doc.moveDown();

    // Customer details
    doc.fontSize(12).text(`Invoice No: ${invoiceNo}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.moveDown();
    
    doc.text('Bill To:');
    doc.text(`Customer Name: ${project.customerName}`);
    doc.text(`Customer Phone: ${project.customerPhone}`);
    doc.moveDown();

    // Project Details Table
    doc.rect(50, doc.y, 500, 20).fill('#f3f4f6').stroke();
    doc.fillColor('#000').text('Project Name', 60, doc.y - 15);
    doc.text('Description', 200, doc.y - 15);
    doc.text('Amount', 450, doc.y - 15);
    
    doc.moveDown();
    const currentY = doc.y + 10;
    doc.text(project.projectName, 60, currentY);
    doc.text(project.description || 'N/A', 200, currentY);
    doc.text(`Rs. ${project.price}`, 450, currentY);

    // Footer
    doc.moveDown(5);
    doc.fontSize(14).text(`Total: Rs. ${project.price}`, { align: 'right' });

    doc.end();

    myWritableStreamBuffer.on('finish', () => {
      const pdfBuffer = myWritableStreamBuffer.getContents();
      
      cloudinary.uploader.upload_stream(
        { resource_type: 'raw', format: 'pdf', public_id: `invoices/${invoiceNo}` },
        (error, result) => {
          if (error) reject(error);
          else resolve(result.secure_url);
        }
      ).end(pdfBuffer);
    });
    
    myWritableStreamBuffer.on('error', reject);
  });
};

module.exports = { generateInvoicePDF };
