import { useState, useEffect } from 'react';
import { useClients, useNextJobNumber } from '../../hooks/useClients';

export default function ProjectForm({ project, onSubmit, onCancel }) {
  const { data: clientsResponse, isLoading: clientsLoading } = useClients();
  const clients = clientsResponse || [];

  const [formData, setFormData] = useState({
    clientId: project?.client_id || '',
    title: project?.title || '',
    description: project?.description || '',
    status: project?.status || 'active',
    startDate: project?.start_date || '',
    dueDate: project?.due_date || ''
  });
  const [errors, setErrors] = useState({});

  const { data: nextJobNumberData } = useNextJobNumber(formData.clientId);

  const validate = () => {
    const newErrors = {};

    if (!formData.clientId) {
      newErrors.clientId = 'Please select a client';
    }

    if (!formData.title || formData.title.trim() === '') {
      newErrors.title = 'Project title is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        clientId: parseInt(formData.clientId),
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        status: formData.status,
        startDate: formData.startDate || null,
        dueDate: formData.dueDate || null
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (clientsLoading) {
    return <div className="loading">Loading clients...</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="clientId">
          Client <span style={{ color: 'var(--danger-color)' }}>*</span>
        </label>
        <select
          id="clientId"
          name="clientId"
          value={formData.clientId}
          onChange={handleChange}
          disabled={!!project}
        >
          <option value="">Select a client...</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.code} - {client.name}
            </option>
          ))}
        </select>
        {errors.clientId && <div className="error">{errors.clientId}</div>}
      </div>

      {!project && formData.clientId && nextJobNumberData && (
        <div style={{
          padding: '0.75rem',
          backgroundColor: 'var(--gray-100)',
          borderRadius: 'var(--border-radius)',
          marginBottom: '1rem',
          fontSize: '0.875rem'
        }}>
          <strong>Next Job Number:</strong>{' '}
          <span style={{ color: 'var(--primary-color)', fontWeight: '600' }}>
            {nextJobNumberData.jobNumber}
          </span>
        </div>
      )}

      {project && (
        <div style={{
          padding: '0.75rem',
          backgroundColor: 'var(--gray-100)',
          borderRadius: 'var(--border-radius)',
          marginBottom: '1rem',
          fontSize: '0.875rem'
        }}>
          <strong>Job Number:</strong>{' '}
          <span style={{ color: 'var(--primary-color)', fontWeight: '600' }}>
            {project.job_number}
          </span>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="title">
          Project Title <span style={{ color: 'var(--danger-color)' }}>*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., Website Redesign"
        />
        {errors.title && <div className="error">{errors.title}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Optional project description"
        />
      </div>

      <div className="form-group">
        <label htmlFor="status">Status</label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="on-hold">On Hold</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="form-group">
          <label htmlFor="startDate">Start Date</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="dueDate">Due Date</label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {project ? 'Update Project' : 'Create Project'}
        </button>
      </div>
    </form>
  );
}
