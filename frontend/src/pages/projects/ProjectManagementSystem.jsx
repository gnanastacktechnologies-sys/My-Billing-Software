import { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Edit, PlusSquare, Trash2, Plus, Minus, Server, Wrench, ArrowRight, Copy } from 'lucide-react';
import DataTable from '../../components/DataTable';

const ProjectManagementSystem = () => {
  // ... (previous state)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    projectName: '',
    projectType: '',
    description: '',
    pricingItems: [{ label: '', startPrice: '', endPrice: '' }],
    hostingStart: '',
    hostingEnd: '',
    maintStart: '',
    maintEnd: '',
    category: 'management'
  });

  // Table State
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [allData, setAllData] = useState([]);

  // Fetch Projects
  const fetchProjects = useCallback(async () => {
    try {
      const res = await axios.get(`/projects?category=management&page=${page}&limit=5`);
      setAllData(res.data.projects);
      setPages(res.data.pages);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      fetchProjects();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchProjects]);

  // Form Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePricingChange = (index, field, value) => {
    const newItems = [...formData.pricingItems];
    newItems[index][field] = value;
    setFormData(prev => ({ ...prev, pricingItems: newItems }));
  };

  const addPricingItem = () => {
    setFormData(prev => ({
      ...prev,
      pricingItems: [...prev.pricingItems, { label: '', startPrice: '', endPrice: '' }]
    }));
  };

  const removePricingItem = (index) => {
    if (formData.pricingItems.length === 1) return;
    const newItems = formData.pricingItems.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, pricingItems: newItems }));
  };

  const totalRange = useMemo(() => {
    const itemsStart = formData.pricingItems.reduce((sum, item) => sum + (Number(item.startPrice) || 0), 0);
    const itemsEnd = formData.pricingItems.reduce((sum, item) => sum + (Number(item.endPrice) || 0), 0);
    
    const start = itemsStart + (Number(formData.hostingStart) || 0) + (Number(formData.maintStart) || 0);
    const end = itemsEnd + (Number(formData.hostingEnd) || 0) + (Number(formData.maintEnd) || 0);
    
    return { start, end };
  }, [formData.pricingItems, formData.hostingStart, formData.hostingEnd, formData.maintStart, formData.maintEnd]);

  const handleEditClick = (project) => {
    setEditingId(project._id);
    setFormData({
      projectName: project.projectName,
      projectType: project.projectType || '',
      description: project.description || '',
      pricingItems: project.pricingItems && project.pricingItems.length > 0 
        ? project.pricingItems 
        : [{ label: 'General', startPrice: project.price, endPrice: project.price }],
      hostingStart: project.hostingStart || '',
      hostingEnd: project.hostingEnd || '',
      maintStart: project.maintStart || '',
      maintEnd: project.maintEnd || '',
      category: 'management'
    });
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyClick = (project) => {
    setEditingId(null);
    setFormData({
      projectName: `${project.projectName} (Copy)`,
      projectType: project.projectType || '',
      description: project.description || '',
      pricingItems: project.pricingItems && project.pricingItems.length > 0 
        ? project.pricingItems.map(item => ({ ...item }))
        : [{ label: 'General', startPrice: project.price, endPrice: project.price }],
      hostingStart: project.hostingStart || '',
      hostingEnd: project.hostingEnd || '',
      maintStart: project.maintStart || '',
      maintEnd: project.maintEnd || '',
      category: 'management'
    });
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.success('Project details copied! Adjust and save as new.');
  };

  const handleAddNewClick = () => {
    setEditingId(null);
    setFormData({
      projectName: '',
      projectType: '',
      description: '',
      pricingItems: [{ label: '', startPrice: '', endPrice: '' }],
      hostingStart: '',
      hostingEnd: '',
      maintStart: '',
      maintEnd: '',
      category: 'management'
    });
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await axios.put(`/projects/${editingId}`, formData);
        toast.success('Project updated successfully!');
      } else {
        await axios.post('/projects', formData);
        toast.success('Project saved successfully!');
      }
      cancelForm();
      fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving project');
    } finally {
      setSaving(false);
    }
  };

  const deleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await axios.delete(`/projects/${id}`);
      toast.success('Project deleted successfully');
      fetchProjects();
    } catch {
      toast.error('Error deleting project');
    }
  };

  // Table Handlers
  const filteredProjects = useMemo(() => {
    if (!searchTerm) return allData;
    const lower = searchTerm.toLowerCase();
    return allData.filter(p => 
      p.projectName.toLowerCase().includes(lower) || 
      (p.projectType && p.projectType.toLowerCase().includes(lower))
    );
  }, [searchTerm, allData]);

  const columns = [
    { header: 'Date', accessor: 'createdAt', render: (row) => format(new Date(row.createdAt), 'dd MMM yyyy') },
    { header: 'Project', accessor: 'projectName', render: (row) => (
      <div>
        <div className="font-medium">{row.projectName}</div>
        <div className="text-xs text-indigo-500 font-semibold">{row.projectType || 'Standard'}</div>
      </div>
    )},
    { header: 'Price Range', render: (row) => {
      const itemsStart = row.pricingItems?.reduce((sum, item) => sum + (item.startPrice || 0), 0);
      const start = itemsStart + (row.hostingStart || 0) + (row.maintStart || 0);
      const end = row.price;
      
      return (
        <div className="flex items-center space-x-1 font-bold text-indigo-600">
          <span>₹{start}</span>
          <ArrowRight size={14} className="text-gray-400" />
          <span>₹{end}</span>
        </div>
      );
    }},
    { header: 'Cost Breakdown', render: (row) => (
      <div className="text-xs space-y-1">
        {row.pricingItems?.map((item, i) => (
          <div key={i} className="flex justify-between w-48 border-b border-gray-100 dark:border-gray-800 pb-0.5 last:border-0">
            <span className="text-gray-500 truncate mr-2">{item.label}:</span>
            <span className="font-medium shrink-0">₹{item.startPrice}-{item.endPrice}</span>
          </div>
        ))}
        {row.hostingEnd > 0 && (
          <div className="flex justify-between w-48 text-blue-600 font-medium">
            <span>Hosting:</span>
            <span>₹{row.hostingStart}-{row.hostingEnd}</span>
          </div>
        )}
        {row.maintEnd > 0 && (
          <div className="flex justify-between w-48 text-emerald-600 font-medium">
            <span>Maintenance:</span>
            <span>₹{row.maintStart}-{row.maintEnd}</span>
          </div>
        )}
      </div>
    )},
    { header: 'Actions', render: (row) => (
      <div className="flex items-center space-x-2">
        <button onClick={() => handleEditClick(row)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors" title="Edit Details">
          <Edit size={18} />
        </button>
        <button onClick={() => handleCopyClick(row)} className="p-1.5 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors" title="Copy / Duplicate">
          <Copy size={18} />
        </button>
        <button onClick={() => deleteProject(row._id)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors" title="Delete Project">
          <Trash2 size={18} />
        </button>
      </div>
    )}
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-white">
          <span className="text-gradient pr-2">Project Management</span> System
        </h1>
        <button onClick={handleAddNewClick} className="flex items-center px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl shadow-lg transition-all transform hover:-translate-y-1">
          <PlusSquare size={20} className="mr-2" />
          Add Project
        </button>
      </div>

      {isFormOpen && (
        <div className="glass rounded-xl p-6 border border-white/50 dark:border-gray-700/50 shadow-soft animate-fade-in-up">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingId ? 'Edit Project' : 'Add New Project'}</h2>
            <button onClick={cancelForm} className="text-sm font-medium text-red-500 hover:text-red-700">Cancel</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Name *</label>
                <input type="text" name="projectName" required value={formData.projectName} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Type *</label>
                <input type="text" name="projectType" required placeholder="e.g. MERN App, Web Design" value={formData.projectType} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white" />
              </div>
            </div>
            
            {/* Pricing Model */}
            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Pricing Model *</label>
              
              {formData.pricingItems.map((item, index) => (
                <div key={index} className="space-y-2 p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl border border-gray-100 dark:border-gray-800 animate-fade-in">
                  <div className="flex gap-4 items-center">
                    <div className="flex-1">
                      <input 
                        type="text" 
                        placeholder="Pricing Model Name" 
                        value={item.label} 
                        onChange={(e) => handlePricingChange(index, 'label', e.target.value)} 
                        required
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="flex gap-2">
                      {index === formData.pricingItems.length - 1 && (
                        <button type="button" onClick={addPricingItem} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"><Plus size={20}/></button>
                      )}
                      {formData.pricingItems.length > 1 && (
                        <button type="button" onClick={() => removePricingItem(index)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Minus size={20}/></button>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-4 items-center">
                    <div className="flex-1 relative">
                       <span className="absolute left-3 top-2 text-gray-400 text-sm">₹</span>
                       <input type="number" placeholder="Min" value={item.startPrice} onChange={(e) => handlePricingChange(index, 'startPrice', e.target.value)} required className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-sm" />
                    </div>
                    <div className="text-gray-400 text-xs font-bold">TO</div>
                    <div className="flex-1 relative">
                       <span className="absolute left-3 top-2 text-gray-400 text-sm">₹</span>
                       <input type="number" placeholder="Max" value={item.endPrice} onChange={(e) => handlePricingChange(index, 'endPrice', e.target.value)} required className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-sm" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Hosting Cost Range */}
            <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-gray-800">
               <label className="flex items-center text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  <Server size={16} className="mr-2" />
                  Hosting & Deployment Cost Range *
               </label>
               <div className="flex gap-4 items-center p-4 bg-blue-50/30 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/20">
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-2 text-blue-400 text-sm">₹</span>
                    <input type="number" name="hostingStart" required value={formData.hostingStart} onChange={handleChange} placeholder="Min Cost" className="w-full pl-8 pr-4 py-2 border border-blue-200 dark:border-blue-900/30 rounded-lg bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white" />
                  </div>
                  <div className="text-blue-400 font-bold">TO</div>
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-2 text-blue-400 text-sm">₹</span>
                    <input type="number" name="hostingEnd" required value={formData.hostingEnd} onChange={handleChange} placeholder="Max Cost" className="w-full pl-8 pr-4 py-2 border border-blue-200 dark:border-blue-900/30 rounded-lg bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white" />
                  </div>
               </div>
            </div>

            {/* Maintenance Cost Range */}
            <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-gray-800">
               <label className="flex items-center text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  <Wrench size={16} className="mr-2" />
                  Monthly Maintenance Cost Range *
               </label>
               <div className="flex gap-4 items-center p-4 bg-emerald-50/30 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/20">
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-2 text-emerald-400 text-sm">₹</span>
                    <input type="number" name="maintStart" required value={formData.maintStart} onChange={handleChange} placeholder="Min Cost" className="w-full pl-8 pr-4 py-2 border border-emerald-200 dark:border-emerald-900/30 rounded-lg bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white" />
                  </div>
                  <div className="text-emerald-400 font-bold">TO</div>
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-2 text-emerald-400 text-sm">₹</span>
                    <input type="number" name="maintEnd" required value={formData.maintEnd} onChange={handleChange} placeholder="Max Cost" className="w-full pl-8 pr-4 py-2 border border-emerald-200 dark:border-emerald-900/30 rounded-lg bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white" />
                  </div>
               </div>
            </div>

            {/* Summary */}
            <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-gray-800">
              <div className="flex justify-between items-center p-4 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                <span className="text-lg font-bold text-gray-700 dark:text-gray-300">Total System Range:</span>
                <div className="flex items-center space-x-3 text-2xl font-black text-indigo-600">
                   <span>₹{totalRange.start}</span>
                   <ArrowRight size={20} className="text-indigo-400" />
                   <span>₹{totalRange.end}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea name="description" rows={2} value={formData.description} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white resize-none"></textarea>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button type="submit" disabled={saving} className="px-10 py-4 rounded-xl font-black text-lg text-white bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-500 hover:to-purple-600 shadow-xl transform transition-all active:scale-95 disabled:opacity-50">
                {saving ? 'Processing...' : (editingId ? 'Update System' : 'Confirm Add')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="shadow-soft rounded-xl overflow-hidden border border-white/20">
        <DataTable 
          columns={columns}
          data={filteredProjects}
          loading={loading}
          page={page}
          pages={pages}
          onPageChange={setPage}
          searchTerm={searchTerm}
          onSearchChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  );
};

export default ProjectManagementSystem;
