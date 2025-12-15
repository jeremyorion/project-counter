import { useState } from 'react';
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from '../hooks/useProjects';
import ProjectList from '../components/projects/ProjectList';
import ProjectModal from '../components/projects/ProjectModal';
import ProjectFilters from '../components/projects/ProjectFilters';

export default function ProjectsPage() {
  const [filters, setFilters] = useState({
    client_id: '',
    status: '',
    search: ''
  });

  const { data: projectsResponse, isLoading, error } = useProjects(filters);
  const projects = projectsResponse || [];

  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [actionError, setActionError] = useState('');

  const handleCreate = () => {
    setSelectedProject(null);
    setModalOpen(true);
    setActionError('');
  };

  const handleEdit = (project) => {
    setSelectedProject(project);
    setModalOpen(true);
    setActionError('');
  };

  const handleSubmit = async (data) => {
    try {
      if (selectedProject) {
        await updateProject.mutateAsync({ id: selectedProject.id, data });
      } else {
        await createProject.mutateAsync(data);
      }
      setModalOpen(false);
      setSelectedProject(null);
      setActionError('');
    } catch (error) {
      setActionError(error.message);
    }
  };

  const handleDelete = async (project) => {
    if (!confirm(`Are you sure you want to delete project "${project.job_number} - ${project.title}"?`)) {
      return;
    }

    try {
      await deleteProject.mutateAsync(project.id);
    } catch (error) {
      alert(`Error deleting project: ${error.message}`);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedProject(null);
    setActionError('');
  };

  if (isLoading) {
    return <div className="loading">Loading projects...</div>;
  }

  if (error) {
    return (
      <div className="card" style={{ backgroundColor: '#fee2e2', borderColor: '#fca5a5' }}>
        <p style={{ color: '#991b1b' }}>Error loading projects: {error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex-between mb-2">
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Projects</h2>
        <button className="btn btn-primary" onClick={handleCreate}>
          + New Project
        </button>
      </div>

      {actionError && (
        <div className="card mb-1" style={{ backgroundColor: '#fee2e2', borderColor: '#fca5a5' }}>
          <p style={{ color: '#991b1b', margin: 0 }}>{actionError}</p>
        </div>
      )}

      <ProjectFilters filters={filters} onFilterChange={setFilters} />

      <div className="mt-2">
        <ProjectList
          projects={projects}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {modalOpen && (
        <ProjectModal
          project={selectedProject}
          onSubmit={handleSubmit}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
