const Project = require('../models/Project');
const Counter = require('../models/Counter');
const Settings = require('../models/Settings');
const { generateInvoicePDF } = require('../utils/generateInvoice');

exports.createProject = async (req, res) => {
  try {
    const { projectName, customerName, customerPhone, description, price, status } = req.body;

    const project = new Project({
      projectName,
      customerName,
      customerPhone,
      description,
      price,
      status: status || 'In Progress'
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
    
    // Server-side pagination and sorting (basic)
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

exports.generateInvoice = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    if (project.invoiceUrl) {
      return res.status(400).json({ message: 'Invoice already generated', invoiceUrl: project.invoiceUrl });
    }

    // Get settings for prefix
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});

    // Auto increment counter
    let counter = await Counter.findOneAndUpdate(
      { id: 'invoiceNo' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true } // Upsert if it doesn't exist
    );

    // If it's a new counter, make sure it starts at settings.invoiceStartNumber
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
    const totalRevenue = projects.reduce((acc, curr) => acc + curr.price, 0);

    const inProgress = projects.filter(p => p.status === 'In Progress').length;
    const completed = projects.filter(p => p.status === 'Completed').length;
    const createProjectStage = projects.filter(p => p.status === 'Create Project').length;

    // Monthly revenue logic (simple, last 6 months)
    const monthlyRevenue = [];
    for(let i=5; i>=0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const month = d.toLocaleString('default', { month: 'short' });
      const year = d.getFullYear();
      
      const startOfMonth = new Date(year, d.getMonth(), 1);
      const endOfMonth = new Date(year, d.getMonth() + 1, 0);
      
      const rev = projects.filter(p => new Date(p.createdAt) >= startOfMonth && new Date(p.createdAt) <= endOfMonth)
                          .reduce((sum, p) => sum + p.price, 0);
                          
      monthlyRevenue.push({ name: `${month} ${year}`, value: rev });
    }

    res.json({
      totalProjects,
      totalRevenue,
      statusBreakdown: {
        'Create Project': createProjectStage,
        'In Progress': inProgress,
        'Completed': completed
      },
      monthlyRevenue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
