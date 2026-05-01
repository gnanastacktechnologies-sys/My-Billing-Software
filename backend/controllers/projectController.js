const Project = require('../models/Project');
const Counter = require('../models/Counter');
const Settings = require('../models/Settings');
const { generateInvoicePDF } = require('../utils/generateInvoice');

exports.createProject = async (req, res) => {
  try {
    const { 
      projectName, customerName, customerPhone, customerEmail, customerAddress, customFields, requirements, requirementNotes, contentPages, deadline, projectType, description, otherNotes, price, 
      pricingItems, hostingCost, maintenanceCost, hostingStart, hostingEnd, maintStart, maintEnd, 
      discountType, discountValue, status, category 
    } = req.body;

    const finalHostingEnd = hostingEnd || hostingCost || 0;
    const finalMaintEnd = maintEnd || maintenanceCost || 0;

    const totalPricingItemsEnd = pricingItems && pricingItems.length > 0 
      ? pricingItems.reduce((sum, item) => sum + (Number(item.endPrice) || 0), 0)
      : (price || 0);
      
    const subtotal = totalPricingItemsEnd + (Number(finalHostingEnd) || 0) + (Number(finalMaintEnd) || 0);
    
    let discount = 0;
    if (discountType === 'amount') {
      discount = Number(discountValue) || 0;
    } else if (discountType === 'percentage') {
      discount = (subtotal * (Number(discountValue) || 0)) / 100;
    }
    
    const totalCalculatedPriceEnd = subtotal - discount;

    const project = new Project({
      projectName,
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      customFields: customFields || [],
      requirements: requirements || {},
      requirementNotes: requirementNotes || {},
      contentPages: contentPages || [],
      deadline,
      projectType,
      description,
      otherNotes,
      price: totalCalculatedPriceEnd,
      pricingItems: pricingItems || [],
      hostingStart: Number(hostingStart) || Number(hostingCost) || 0,
      hostingEnd: Number(finalHostingEnd),
      maintStart: Number(maintStart) || Number(maintenanceCost) || 0,
      maintEnd: Number(finalMaintEnd),
      discountType: discountType || 'none',
      discountValue: Number(discountValue) || 0,
      status: status || 'In Progress',
      category: category || 'billing'
    });

    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const projects = await Project.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const total = await Project.countDocuments(filter);

    res.json({
      projects,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProjectStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    project.status = status;
    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { 
      projectName, customerName, customerPhone, customerEmail, customerAddress, customFields, requirements, requirementNotes, deadline, projectType, description, otherNotes, price, 
      pricingItems, hostingStart, hostingEnd, maintStart, maintEnd,
      discountType, discountValue
    } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    project.projectName = projectName || project.projectName;
    project.customerName = customerName !== undefined ? customerName : project.customerName;
    project.customerPhone = customerPhone !== undefined ? customerPhone : project.customerPhone;
    project.customerEmail = customerEmail !== undefined ? customerEmail : project.customerEmail;
    project.customerAddress = customerAddress !== undefined ? customerAddress : project.customerAddress;
    project.customFields = customFields !== undefined ? customFields : project.customFields;
    project.requirements = requirements !== undefined ? requirements : project.requirements;
    project.requirementNotes = requirementNotes !== undefined ? requirementNotes : project.requirementNotes;
    project.contentPages = contentPages !== undefined ? contentPages : project.contentPages;
    project.deadline = deadline !== undefined ? deadline : project.deadline;
    project.projectType = projectType || project.projectType;
    project.description = description || project.description;
    project.otherNotes = otherNotes !== undefined ? otherNotes : project.otherNotes;
    project.discountType = discountType !== undefined ? discountType : project.discountType;
    project.discountValue = discountValue !== undefined ? Number(discountValue) : project.discountValue;

    project.hostingStart = hostingStart !== undefined ? Number(hostingStart) : project.hostingStart;
    project.hostingEnd = hostingEnd !== undefined ? Number(hostingEnd) : project.hostingEnd;
    project.maintStart = maintStart !== undefined ? Number(maintStart) : project.maintStart;
    project.maintEnd = maintEnd !== undefined ? Number(maintEnd) : project.maintEnd;
    
    if (pricingItems) {
      project.pricingItems = pricingItems;
    }

    // Recalculate price
    const basePriceEnd = project.pricingItems.reduce((sum, item) => sum + (Number(item.endPrice) || 0), 0);
    const subtotal = basePriceEnd + project.hostingEnd + project.maintEnd;
    
    let discount = 0;
    if (project.discountType === 'amount') {
      discount = project.discountValue;
    } else if (project.discountType === 'percentage') {
      discount = (subtotal * project.discountValue) / 100;
    }
    
    project.price = subtotal - discount;
    
    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.generateInvoice = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    if (project.invoiceUrl) {
      return res.status(400).json({ message: 'Invoice already generated', invoiceUrl: project.invoiceUrl });
    }

    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});

    let counter = await Counter.findOneAndUpdate(
      { id: 'invoiceNo' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    if (counter.seq === 1 && settings.invoiceStartNumber > 1) {
       counter.seq = settings.invoiceStartNumber;
       await counter.save();
    }

    const paddedSeq = counter.seq.toString().padStart(4, '0');
    const invoiceNo = `${settings.invoicePrefix}-${paddedSeq}`;

    const pdfUrl = await generateInvoicePDF(project, invoiceNo);
    
    project.invoiceNo = invoiceNo;
    project.invoiceUrl = pdfUrl;
    await project.save();

    res.json({ invoiceNo: project.invoiceNo, invoiceUrl: project.invoiceUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments();
    const projects = await Project.find();
    
    const billingProjects = projects.filter(p => p.category === 'billing');
    const totalRevenue = billingProjects.reduce((acc, curr) => acc + curr.price, 0);

    const inProgress = billingProjects.filter(p => p.status === 'In Progress').length;
    const completed = billingProjects.filter(p => p.status === 'Completed').length;
    const createProjectStage = billingProjects.filter(p => p.status === 'Create Project').length;

    const managementCount = projects.filter(p => p.category === 'management').length;

    const monthlyRevenue = [];
    for(let i=5; i>=0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const month = d.toLocaleString('default', { month: 'short' });
      const year = d.getFullYear();
      
      const startOfMonth = new Date(year, d.getMonth(), 1);
      const endOfMonth = new Date(year, d.getMonth() + 1, 0);
      
      const rev = billingProjects.filter(p => new Date(p.createdAt) >= startOfMonth && new Date(p.createdAt) <= endOfMonth)
                                 .reduce((sum, p) => sum + p.price, 0);
                          
      monthlyRevenue.push({ name: `${month} ${year}`, value: rev });
    }

    res.json({
      totalProjects,
      totalRevenue,
      statusBreakdown: {
        'Create Project': createProjectStage,
        'In Progress': inProgress,
        'Completed': completed,
        'Management': managementCount
      },
      monthlyRevenue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
