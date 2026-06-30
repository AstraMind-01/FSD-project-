import React, { createContext, useContext, useState } from 'react';
import * as projectService from '../services/projectService';
import * as taskService from '../services/taskService';

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await projectService.getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectProject = async (id) => {
    setLoading(true);
    try {
      const projectData = await projectService.getProjectById(id);
      setCurrentProject(projectData);
      const tasksData = await taskService.getTasksByProject(id);
      setTasks(tasksData);
    } catch (error) {
      console.error('Error selecting project:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        currentProject,
        tasks,
        loading,
        setProjects,
        setCurrentProject,
        setTasks,
        fetchProjects,
        selectProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};
