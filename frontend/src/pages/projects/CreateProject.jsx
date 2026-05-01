import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Sparkles, CheckCircle2, Circle, Percent, Banknote, User, Mail, MapPin, Calendar, Plus, Trash2, Tag, Layout, PenTool, StickyNote, Files } from 'lucide-react';

const LayoutBox = ({ label, active, onClick, className = '' }) => (
  <div 
    onClick={onClick}
    className={`cursor-pointer transition-all duration-300 border-2 rounded flex items-center justify-center text-[10px] font-bold p-2 ${
      active 
        ? 'bg-blue-500 border-blue-600 text-white shadow-inner' 
        : 'bg-gray-100 border-gray-200 text-gray-400 border-dashed opacity-50 grayscale hover:grayscale-0 hover:opacity-100'
    } ${className}`}
  >
    <span className="text-center truncate px-1">
      {active ? label : `${label} (Not Req)`}
    </span>
  </div>
);

const CreateProject = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [presets, setPresets] = useState([]);
  const [selectedPresetItems, setSelectedPresetItems] = useState([]);
  const [formData, setFormData] = useState({
    projectName: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerAddress: '',
    customFields: [],
    requirements: {
      header: true,
      menu: true,
      sidebar: false,
      content: true,
      footer: true,
      container: true
    },
    requirementNotes: {
      header: '',
      menu: '',
      sidebar: '',
      content: '',
      footer: '',
      container: ''
    },
    contentPages: [
      { name: 'Home Page', note: '' }
    ],
    deadline: '',
    projectType: '',
    description: '',
    otherNotes: '',
    price: 0,
    hostingCost: 0,
    maintenanceCost: 0,
    discountType: 'none',
    discountValue: 0,
    status: 'In Progress',
    category: 'billing',
    pricingItems: []
  });



  // Fetch presets from Project Management System
  useEffect(() => {
    const fetchPresets = async () => {
      try {
        const res = await axios.get('/projects?category=management&limit=100');
        setPresets(res.data.projects);
      } catch (error) {
        console.error('Error fetching presets:', error);
      }
    };
    fetchPresets();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePresetChange = (e) => {
    const presetId = e.target.value;
    if (!presetId) {
      setSelectedPresetItems([]);
      return;
    }

    const preset = presets.find(p => p._id === presetId);
    if (preset) {
      const initialItems = (preset.pricingItems || []).map(item => ({
        ...item,
        selected: false
      }));
      
      setSelectedPresetItems(initialItems);
      
      setFormData(prev => ({
        ...prev,
        projectName: preset.projectName,
        projectType: preset.projectType,
        description: preset.description,
        hostingCost: preset.hostingEnd || 0,
        maintenanceCost: preset.maintEnd || 0,
        price: 0,
        pricingItems: []
      }));
      
      toast.success(`Template loaded. Please select pricing models below.`);
    }
  };

  const toggleItem = (index) => {
    const updatedItems = [...selectedPresetItems];
    updatedItems[index].selected = !updatedItems[index].selected;
    setSelectedPresetItems(updatedItems);
    
    const activeItems = updatedItems.filter(i => i.selected);
    setFormData(prev => ({ ...prev, pricingItems: activeItems }));
    updatePrice(updatedItems);
  };

  const updatePrice = (items) => {
    const newPrice = items
      .filter(item => item.selected)
      .reduce((sum, item) => sum + (Number(item.endPrice) || 0), 0);
    setFormData(prev => ({ ...prev, price: newPrice }));
  };

  // Requirements Toggler
  const toggleRequirement = (key) => {
    setFormData(prev => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        [key]: !prev.requirements[key]
      }
    }));
  };

  const handleNoteChange = (key, val) => {
    setFormData(prev => ({
      ...prev,
      requirementNotes: {
        ...prev.requirementNotes,
        [key]: val
      }
    }));
  };

  // Content Pages CRUD
  const addContentPage = () => {
    setFormData(prev => ({
      ...prev,
      contentPages: [...prev.contentPages, { name: '', note: '' }]
    }));
    toast.success("New page added to layout");
  };

  const removeContentPage = (index) => {
    if (formData.contentPages.length <= 1) return toast.error("At least one page is required");
    const newPages = formData.contentPages.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, contentPages: newPages }));
    toast.success("Page removed from layout");
  };

  const handlePageChange = (index, field, val) => {
    const newPages = [...formData.contentPages];
    newPages[index][field] = val;
    setFormData(prev => ({ ...prev, contentPages: newPages }));
  };

  // Custom Fields Handlers
  const addCustomField = () => {
    setFormData(prev => ({
      ...prev,
      customFields: [...prev.customFields, { label: '', value: '' }]
    }));
  };

  const removeCustomField = (index) => {
    const newFields = formData.customFields.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, customFields: newFields }));
  };

  const handleCustomFieldChange = (index, field, val) => {
    const newFields = [...formData.customFields];
    newFields[index][field] = val;
    setFormData(prev => ({ ...prev, customFields: newFields }));
  };

  const subtotal = Number(formData.price) + Number(formData.hostingCost || 0) + Number(formData.maintenanceCost || 0);
  
  let discountAmount = 0;
  if (formData.discountType === 'amount') {
    discountAmount = Number(formData.discountValue) || 0;
  } else if (formData.discountType === 'percentage') {
    discountAmount = (subtotal * (Number(formData.discountValue) || 0)) / 100;
  }

  const grandTotal = subtotal - discountAmount;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.customerName || !formData.customerPhone) {
        return toast.error('Customer details are required');
    }
    setLoading(true);
    try {
      await axios.post('/projects', formData);
      toast.success('Project saved successfully!');
      navigate('/projects/in-progress');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving project');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndInvoice = async (e) => {
    e.preventDefault();
    if (!formData.customerName || !formData.customerPhone) {
        return toast.error('Customer details are required');
    }
    setLoading(true);
    try {
      const res = await axios.post('/projects', formData);
      const project = res.data;
      
      toast.success('Project saved! Generating invoice...');
      
      const invoiceRes = await axios.post(`/projects/${project._id}/invoice`);
      const { invoiceNo, invoiceUrl } = invoiceRes.data;
      
      toast.success('Invoice generated successfully!');
      
      const encodedMessage = encodeURIComponent(
        `GnanaStack Technologies\n\nInvoice No: ${invoiceNo}\nTotal: ₹${grandTotal}\n\nDownload Invoice:\n${invoiceUrl}`
      );
      const waLink = `https://wa.me/${formData.customerPhone}?text=${encodedMessage}`;
      
      window.open(waLink, '_blank');
      navigate('/projects/in-progress');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating project or invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up pb-20 relative">
      <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-white">
          <span className="text-gradient pr-2">Create</span> New Project
          </h1>
      </div>

      <div className="glass rounded-xl p-6 md:p-8 border border-white/50 dark:border-gray-700/50 shadow-soft">
        <form className="space-y-8">
          {/* Step 1: Preset Selection */}
          <div className="p-5 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-gray-900 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 shadow-sm">
            <label className="flex items-center text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3">
              <Sparkles size={18} className="mr-2" />
              Step 1: Select Project Template
            </label>
            <select onChange={handlePresetChange} className="w-full px-4 py-3 border border-indigo-200 dark:border-indigo-900/30 rounded-xl bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white outline-none">
              <option value="">-- Choose from Management Presets --</option>
              {presets.map(p => (
                <option key={p._id} value={p._id}>{p.projectName} ({p.projectType})</option>
              ))}
            </select>

            {selectedPresetItems.length > 0 && (
              <div className="mt-6 space-y-3 animate-fade-in">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Configure Pricing Items:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedPresetItems.map((item, idx) => (
                    <div key={idx} onClick={() => toggleItem(idx)} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${item.selected ? 'bg-indigo-600 border-indigo-600 text-white shadow-md transform scale-[1.02]' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-indigo-300'}`}>
                      <div className="flex items-center gap-2">
                        {item.selected ? <CheckCircle2 size={18}/> : <Circle size={18}/>}
                        <span className="font-medium text-sm">{item.label}</span>
                      </div>
                      <span className={`text-xs font-bold ${item.selected ? 'text-indigo-100' : 'text-gray-400'}`}>₹{item.endPrice}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Name *</label>
              <input type="text" name="projectName" required value={formData.projectName} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Type</label>
              <input type="text" name="projectType" value={formData.projectType} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                 <Calendar size={16} className="mr-2 text-indigo-500" />
                 Project Last Date (Deadline)
              </label>
              <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white" />
            </div>
          </div>

          {/* Financial Details */}
          <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-gray-800">
             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Financial Details</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Base Price</label>
                  <div className="text-xl font-black text-gray-900 dark:text-white">₹{formData.price}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hosting Cost (₹)</label>
                  <input type="number" name="hostingCost" value={formData.hostingCost} onChange={handleChange} className="w-full px-4 py-2 border border-blue-200 dark:border-blue-900/30 rounded-lg bg-blue-50/30 dark:bg-blue-900/10 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Maintenance Cost (₹)</label>
                  <input type="number" name="maintenanceCost" value={formData.maintenanceCost} onChange={handleChange} className="w-full px-4 py-2 border border-emerald-200 dark:border-emerald-900/30 rounded-lg bg-emerald-50/30 dark:bg-emerald-900/10 text-gray-900 dark:text-white" />
                </div>
             </div>

             {/* Discount */}
             <div className="p-4 bg-orange-50/50 dark:bg-orange-950/10 rounded-xl border border-orange-100 dark:border-orange-900/30">
                <label className="flex items-center text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest mb-3">Apply Discount</label>
                <div className="flex gap-4">
                  <select name="discountType" value={formData.discountType} onChange={handleChange} className="flex-1 px-4 py-2 border border-orange-200 dark:border-orange-900/30 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none">
                      <option value="none">No Discount</option>
                      <option value="amount">Fixed Amount (₹)</option>
                      <option value="percentage">Percentage (%)</option>
                  </select>
                  {formData.discountType !== 'none' && (
                     <div className="flex-1 relative">
                        <span className="absolute left-3 top-2 text-orange-400">
                           {formData.discountType === 'amount' ? <Banknote size={16}/> : <Percent size={16}/>}
                        </span>
                        <input type="number" name="discountValue" value={formData.discountValue} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border border-orange-200 dark:border-orange-900/30 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none" />
                     </div>
                  )}
                </div>
             </div>

             <div className="p-6 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-xl flex justify-between items-center text-white">
                <div>
                  <span className="block text-indigo-200 text-xs font-bold uppercase tracking-widest">Grand Total Amount</span>
                  <span className="text-3xl font-black">₹{grandTotal}</span>
                </div>
                <div className="text-right text-indigo-100 text-xs">
                  {discountAmount > 0 && <div>- ₹{discountAmount} Discount Applied</div>}
                  <div>Subtotal: ₹{subtotal}</div>
                </div>
             </div>
          </div>

          {/* Step 2: Customer Information */}
          <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-gray-800">
             <div className="flex items-center justify-between">
                <h3 className="flex items-center text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                  <User size={16} className="mr-2" />
                  Step 2: Customer Information
                </h3>
                <button 
                  type="button" 
                  onClick={addCustomField} 
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-all active:scale-95 shadow-md shadow-indigo-500/20"
                >
                  <Plus size={14} className="stroke-[3]" />
                  Add Custom Field
                </button>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Name *</label>
                  <input type="text" name="customerName" required value={formData.customerName} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Phone *</label>
                  <input type="text" name="customerPhone" required placeholder="91..." value={formData.customerPhone} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Mail size={16} className="mr-2 text-indigo-400" />
                    Email ID
                  </label>
                  <input type="email" name="customerEmail" value={formData.customerEmail} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <MapPin size={16} className="mr-2 text-indigo-400" />
                    Address
                  </label>
                  <input type="text" name="customerAddress" value={formData.customerAddress} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white" />
                </div>
             </div>

             {/* Dynamic Custom Fields CRUD */}
             {formData.customFields.length > 0 && (
               <div className="space-y-6 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {formData.customFields.map((field, idx) => (
                       <div key={idx} className="relative group p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700 animate-fade-in">
                          <button 
                            type="button" 
                            onClick={() => removeCustomField(idx)} 
                            className="absolute -top-2 -right-2 p-1.5 bg-white dark:bg-gray-800 text-red-400 hover:text-red-600 border border-gray-200 dark:border-gray-700 rounded-full shadow-sm transition-all z-10"
                          >
                             <Trash2 size={14} />
                          </button>
                          <div className="space-y-3">
                             <div>
                                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                   <Tag size={14} className="mr-2 text-indigo-400" />
                                   Field Label
                                </label>
                                <input 
                                  type="text" 
                                  placeholder="e.g. GST Number" 
                                  value={field.label} 
                                  onChange={(e) => handleCustomFieldChange(idx, 'label', e.target.value)}
                                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-indigo-500 text-sm"
                                />
                             </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Field Value</label>
                                <input 
                                  type="text" 
                                  placeholder={field.label ? `Enter ${field.label}...` : "Enter value..."} 
                                  value={field.value} 
                                  onChange={(e) => handleCustomFieldChange(idx, 'value', e.target.value)}
                                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-indigo-500 text-sm"
                                />
                             </div>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
             )}
          </div>

          {/* Step 3: Project Requirements (Layout) */}
          <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-gray-800">
             <h3 className="flex items-center text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                <Layout size={16} className="mr-2" />
                Step 3: Project Requirements (Layout)
             </h3>
             
             <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
                <p className="text-xs text-gray-500 mb-6 italic text-center">Click on any section to toggle its requirement for this project.</p>
                
                {/* Visual Layout Builder */}
                <div className={`mx-auto max-w-md p-4 transition-all duration-500 rounded-lg border-2 ${formData.requirements.container ? 'bg-orange-100 border-orange-300' : 'bg-gray-100 border-gray-200 opacity-50 grayscale'}`}>
                  <div onClick={() => toggleRequirement('container')} className="text-center text-[8px] font-black uppercase text-orange-500 mb-2 cursor-pointer">
                     {formData.requirements.container ? 'Container (Wrapper)' : 'No Wrapper'}
                  </div>

                  <div className="space-y-2">
                     {/* Header */}
                     <LayoutBox 
                       label={formData.requirementNotes.header || "Banner (Header)"} 
                       active={formData.requirements.header} 
                       onClick={() => toggleRequirement('header')} 
                       className="h-10"
                     />

                     {/* Navigation */}
                     <LayoutBox 
                       label={formData.requirementNotes.menu || "Navigation (Menu)"} 
                       active={formData.requirements.menu} 
                       onClick={() => toggleRequirement('menu')} 
                       className="h-8"
                     />

                     {/* Middle Body */}
                     <div className="flex gap-2 min-h-[140px]">
                        {/* Sidebar */}
                        <LayoutBox 
                          label={formData.requirementNotes.sidebar || "Sidebar"} 
                          active={formData.requirements.sidebar} 
                          onClick={() => toggleRequirement('sidebar')} 
                          className="w-1/4"
                        />

                        {/* Content Pages Stack */}
                        <div className="flex-1 flex flex-col gap-1 overflow-hidden">
                           {formData.requirements.content ? (
                              formData.contentPages.map((page, idx) => (
                                 <div key={idx} className={`flex-1 border border-blue-400 bg-blue-500 text-white rounded flex items-center justify-center text-[9px] font-bold shadow-sm transition-all animate-fade-in ${idx > 2 ? 'opacity-50' : ''}`}>
                                    <span className="truncate px-1">{page.name || `Page ${idx + 1}`}</span>
                                 </div>
                              ))
                           ) : (
                              <div className="flex-1 border-2 border-gray-200 border-dashed bg-gray-100 opacity-50 flex items-center justify-center text-[10px] text-gray-400 font-bold rounded">
                                 No Main Content
                              </div>
                           )}
                        </div>
                     </div>

                     {/* Footer */}
                     <LayoutBox 
                       label={formData.requirementNotes.footer || "Footer (Copyright)"} 
                       active={formData.requirements.footer} 
                       onClick={() => toggleRequirement('footer')} 
                       className="h-10"
                     />
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
                   {Object.keys(formData.requirements).map((key) => (
                      <div key={key} onClick={() => toggleRequirement(key)} className="flex items-center gap-2 cursor-pointer group">
                         <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${formData.requirements[key] ? 'bg-blue-500 border-blue-500' : 'bg-white dark:bg-gray-800 border-gray-300 group-hover:border-blue-400'}`}>
                            {formData.requirements[key] && <CheckCircle2 size={10} className="text-white" />}
                         </div>
                         <span className={`text-xs capitalize ${formData.requirements[key] ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-400'}`}>{key}</span>
                      </div>
                   ))}
                </div>

                {/* Dynamic Note Inputs for Selected Requirements */}
                <div className="mt-8 space-y-4 animate-fade-in">
                   {/* Static Requirements Notes */}
                   {Object.entries(formData.requirements).map(([key, active]) => {
                      if (!active || key === 'content') return null;
                      const labels = {
                         header: 'Banner (Header)',
                         menu: 'Navigation (Menu)',
                         sidebar: 'Sidebar Layout',
                         footer: 'Footer Layout',
                         container: 'Container Wrapper'
                      };
                      return (
                         <div key={key} className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm animate-fade-in-up">
                            <label className="flex items-center text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">
                               <PenTool size={14} className="mr-2" />
                               {labels[key]} Requirement
                            </label>
                            <input 
                              type="text" 
                              placeholder={`Enter specific requirements for ${labels[key]}...`} 
                              value={formData.requirementNotes[key]} 
                              onChange={(e) => handleNoteChange(key, e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50/50 dark:bg-gray-900/50 text-sm text-gray-900 dark:text-white focus:ring-blue-500"
                            />
                         </div>
                      );
                   })}

                   {/* Dynamic Content Pages Requirements */}
                   {formData.requirements.content && (
                      <div className="space-y-4 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700">
                         <div className="flex items-center justify-between">
                            <h4 className="flex items-center text-xs font-black text-gray-400 uppercase tracking-widest">
                               <Files size={14} className="mr-2" />
                               Main Content Pages ({formData.contentPages.length})
                            </h4>
                            <button 
                              type="button" 
                              onClick={addContentPage} 
                              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-all active:scale-95 shadow-md shadow-indigo-500/20"
                            >
                              <Plus size={14} className="stroke-[3]" />
                              Add More Page
                            </button>
                         </div>
                         <div className="grid grid-cols-1 gap-4">
                            {formData.contentPages.map((page, idx) => (
                               <div key={idx} className="relative p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm animate-fade-in-up">
                                  <div className="absolute -top-2 -left-2 w-6 h-6 bg-blue-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md z-10">
                                     {idx + 1}
                                  </div>
                                  <button 
                                    type="button" 
                                    onClick={() => removeContentPage(idx)} 
                                    className="absolute -top-2 -right-2 p-1.5 bg-white dark:bg-gray-800 text-red-400 hover:text-red-600 border border-gray-200 dark:border-gray-700 rounded-full shadow-sm transition-all z-10"
                                  >
                                     <Trash2 size={12} />
                                  </button>
                                  <div className="space-y-3">
                                     <div>
                                        <label className="block text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">Page {idx + 1} Name</label>
                                        <input 
                                          type="text" 
                                          placeholder={`e.g. ${idx === 0 ? 'Home Page' : 'Page ' + (idx + 1)}`} 
                                          value={page.name} 
                                          onChange={(e) => handlePageChange(idx, 'name', e.target.value)}
                                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50/50 dark:bg-gray-900/50 text-sm font-bold text-gray-900 dark:text-white focus:ring-blue-500"
                                        />
                                     </div>
                                     <div>
                                        <label className="block text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">Page {idx + 1} Specific Requirements</label>
                                        <textarea 
                                          rows={2}
                                          placeholder="Enter page specific requirements..." 
                                          value={page.note} 
                                          onChange={(e) => handlePageChange(idx, 'note', e.target.value)}
                                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50/50 dark:bg-gray-900/50 text-sm text-gray-900 dark:text-white focus:ring-blue-500 resize-none"
                                        />
                                     </div>
                                  </div>
                               </div>
                            ))}
                         </div>
                      </div>
                   )}
                </div>
             </div>
          </div>

          {/* Description & Other Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-100 dark:border-gray-800">
             <div className="space-y-4">
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                   <PenTool size={16} className="mr-2 text-indigo-500" />
                   Project Description & Notes
                </label>
                <textarea 
                  name="description" 
                  rows={4} 
                  value={formData.description} 
                  onChange={handleChange} 
                  placeholder="Enter main project description here..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-indigo-500 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white resize-none shadow-sm"
                ></textarea>
             </div>
             <div className="space-y-4">
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                   <StickyNote size={16} className="mr-2 text-purple-500" />
                   Other Project description & notes
                </label>
                <textarea 
                  name="otherNotes" 
                  rows={4} 
                  value={formData.otherNotes} 
                  onChange={handleChange} 
                  placeholder="Enter any additional internal notes or miscellaneous details..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-purple-500 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white resize-none shadow-sm"
                ></textarea>
             </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">

            <button 
              type="button" 
              onClick={handleSave} 
              disabled={loading} 
              className="px-8 py-3 rounded-xl font-bold text-sm text-gray-700 dark:text-gray-200 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-all disabled:opacity-50 shadow-md active:scale-95"
            >
              Save Project
            </button>
            <button 
              type="button" 
              onClick={handleSaveAndInvoice} 
              disabled={loading} 
              className="px-8 py-3 rounded-xl font-black text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all disabled:opacity-50 shadow-md hover:shadow-lg shadow-indigo-500/20 active:scale-95 transform hover:-translate-y-0.5"
            >
              Save & Generate Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;
