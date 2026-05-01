import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const CreateProject = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    projectName: '',
    customerName: '',
    customerPhone: '',
    description: '',
    price: '',
    status: 'In Progress',
    category: 'billing'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
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
    setLoading(true);
    try {
      const res = await axios.post('/projects', formData);
      const project = res.data;
      
      toast.success('Project saved! Generating invoice...');
      
      const invoiceRes = await axios.post(`/projects/${project._id}/invoice`);
      const { invoiceNo, invoiceUrl } = invoiceRes.data;
      
      toast.success('Invoice generated successfully!');
      
      // WhatsApp link format
      const encodedMessage = encodeURIComponent(
        `GnanaStack Technologies\n\nInvoice No: ${invoiceNo}\nTotal: ₹${formData.price}\n\nDownload Invoice:\n${invoiceUrl}`
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
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-white">
          <span className="text-gradient pr-2">Create</span> New Project
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass rounded-xl p-6 md:p-8 border border-white/50 dark:border-gray-700/50 shadow-soft">
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Name *</label>
                <input
                  type="text"
                  name="projectName"
                  required
                  value={formData.projectName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white backdrop-blur-sm transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (₹) *</label>
                <input
                  type="number"
                  name="price"
                  required
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white backdrop-blur-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Name *</label>
                <input
                  type="text"
                  name="customerName"
                  required
                  value={formData.customerName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white backdrop-blur-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Phone *</label>
                <input
                  type="text"
                  name="customerPhone"
                  required
                  placeholder="e.g. 919876543210"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white backdrop-blur-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white resize-none backdrop-blur-sm transition-all"
              ></textarea>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-all disabled:opacity-50"
              >
                Save Project
              </button>
              <button
                type="button"
                onClick={handleSaveAndInvoice}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all disabled:opacity-50 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Save & Generate Invoice
              </button>
            </div>
          </form>
        </div>

        {/* GnanaStack Standard Workflow Sidebar */}
        <div className="glass rounded-xl p-6 border border-white/50 dark:border-gray-700/50 shadow-soft h-fit">
          <h3 className="text-xl font-heading font-bold text-gray-900 dark:text-white mb-6">GnanaStack Workflow</h3>
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 dark:before:via-gray-600 before:to-transparent">
            {[
              { step: 1, title: 'Discuss your data', desc: 'Requirements gathering' },
              { step: 2, title: 'Plan features', desc: 'Architecture & mapping' },
              { step: 3, title: 'Design UI', desc: 'Wireframes & prototyping' },
              { step: 4, title: 'Develop MERN App', desc: 'Full-stack engineering' },
              { step: 5, title: 'Test and Improve', desc: 'QA & optimizations' },
              { step: 6, title: 'Deploy and Support', desc: 'Launch & maintenance' }
            ].map((item) => (
              <div key={item.step} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-gray-800 bg-indigo-500 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  {item.step}
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-md">
                  <div className="font-bold text-gray-900 dark:text-white">{item.title}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProject;
