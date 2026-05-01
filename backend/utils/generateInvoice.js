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
    if (project.customerEmail) doc.text(`Customer Email: ${project.customerEmail}`);
    if (project.customerAddress) doc.text(`Customer Address: ${project.customerAddress}`);
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
    doc.text(`Rs. ${project.price - (project.hostingEnd || 0) - (project.maintEnd || 0)}`, 450, currentY);

    let nextY = currentY + 20;
    if (project.hostingEnd > 0) {
      doc.text('Hosting & Deployment', 60, nextY);
      doc.text('One-time setup', 200, nextY);
      doc.text(`Rs. ${project.hostingEnd}`, 450, nextY);
      nextY += 20;
    }

    if (project.maintEnd > 0) {
      doc.text('Monthly Maintenance', 60, nextY);
      doc.text('Support & Updates', 200, nextY);
      doc.text(`Rs. ${project.maintEnd}`, 450, nextY);
      nextY += 20;
    }

    const subtotal = project.price + (project.discountType === 'percentage' ? (project.price / (1 - project.discountValue / 100)) - project.price : (project.discountType === 'amount' ? project.discountValue : 0));
    // Note: The above is a bit complex because project.price is already the final price.
    // Let's just use the fields stored in the model to show the breakdown.
    
    // Footer
    doc.moveDown(4);
    
    // Subtotal
    const baseAmount = project.price + (project.discountType === 'percentage' ? 
      (project.price / (1 - project.discountValue / 100)) * (project.discountValue / 100) : 
      project.discountValue);
      
    // Actually, it's easier to just calculate it from the stored fields:
    const calculatedSubtotal = (project.price + (project.discountType === 'amount' ? project.discountValue : 0)) / (project.discountType === 'percentage' ? (1 - project.discountValue/100) : 1);
    // This is getting tricky because of floating points. 
    // Let's just use the direct logic:
    
    doc.fontSize(10).text('Subtotal:', 350, doc.y);
    doc.text(`Rs. ${project.price + (project.discountType === 'none' ? 0 : (project.discountType === 'amount' ? project.discountValue : (project.price / (1 - project.discountValue/100)) * (project.discountValue/100)))}`, 450, doc.y - 12);
    
    if (project.discountType !== 'none') {
      doc.fillColor('#ef4444').text(`Discount (${project.discountType === 'percentage' ? project.discountValue + '%' : 'Fixed'}):`, 350, doc.y + 5);
      const discVal = project.discountType === 'percentage' ? (project.price / (1 - project.discountValue/100)) * (project.discountValue/100) : project.discountValue;
      doc.text(`- Rs. ${discVal.toFixed(2)}`, 450, doc.y - 12);
      doc.fillColor('#000');
    }
    
    doc.moveDown();
    doc.fontSize(16).fillColor('#4f46e5').text('Grand Total:', 350, doc.y);
    doc.text(`Rs. ${project.price.toFixed(2)}`, 450, doc.y - 18);

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
