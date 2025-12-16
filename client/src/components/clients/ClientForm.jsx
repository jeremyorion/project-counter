import { useState } from 'react';

export default function ClientForm({ client, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    code: client?.code || '',
    name: client?.name || '',
    currentCounter: client?.current_counter || 0
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!formData.code) {
      newErrors.code = 'Client code is required';
    } else if (formData.code.length !== 3) {
      newErrors.code = 'Client code must be exactly 3 characters';
    } else if (!/^[A-Z]{3}$/i.test(formData.code)) {
      newErrors.code = 'Client code must contain only letters';
    }

    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Client name is required';
    }

    if (client && formData.currentCounter < 0) {
      newErrors.currentCounter = 'Last job number cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const submitData = {
        code: formData.code.toUpperCase(),
        name: formData.name.trim()
      };

      // Only include currentCounter when editing
      if (client) {
        submitData.currentCounter = parseInt(formData.currentCounter);
      }

      onSubmit(submitData);
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

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="code">
          Client Code <span style={{ color: 'var(--danger-color)' }}>*</span>
        </label>
        <input
          type="text"
          id="code"
          name="code"
          value={formData.code}
          onChange={handleChange}
          maxLength={3}
          placeholder="e.g., INS, PON"
          style={{ textTransform: 'uppercase' }}
        />
        {errors.code && <div className="error">{errors.code}</div>}
        <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>
          3-letter code (uppercase)
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="name">
          Client Name <span style={{ color: 'var(--danger-color)' }}>*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Inspire, Premier"
        />
        {errors.name && <div className="error">{errors.name}</div>}
      </div>

      {client && (
        <div className="form-group">
          <label htmlFor="currentCounter">
            Last Job Number
          </label>
          <input
            type="number"
            id="currentCounter"
            name="currentCounter"
            value={formData.currentCounter}
            onChange={handleChange}
            min="0"
            placeholder="0"
          />
          {errors.currentCounter && <div className="error">{errors.currentCounter}</div>}
          <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>
            The last claimed job number. Next will be {formData.currentCounter ? parseInt(formData.currentCounter) + 1 : 1} ({formData.code || 'XXX'}-{String((formData.currentCounter ? parseInt(formData.currentCounter) : 0) + 1).padStart(3, '0')})
          </div>
        </div>
      )}

      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {client ? 'Update Client' : 'Create Client'}
        </button>
      </div>
    </form>
  );
}
