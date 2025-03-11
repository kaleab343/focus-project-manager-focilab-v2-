import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Trash2 } from "lucide-react";
import { useTheme } from '../context/ThemeContext';
import { type Project, type Milestone } from '../hooks/useProjects';

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project;
  onSave: (projectId: string, updates: Partial<Project>) => void;
  onDelete: (id: string) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const ProjectSidebar: React.FC<ProjectSidebarProps> = ({
  isOpen,
  onClose,
  project,
  onSave,
  onDelete
}) => {
  const { theme } = useTheme();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Project['status']>('Not Started');
  const [startDate, setStartDate] = useState('');
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [newMilestoneName, setNewMilestoneName] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const isProjectCard = target.closest('.project-card-container');
      
      if (sidebarRef.current && 
          !sidebarRef.current.contains(target) && 
          !isProjectCard) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description);
      setStatus(project.status);
      setStartDate(project.startDate || '');
      setMilestones(project.milestones || []);
    }
  }, [project]);

  const handleSave = () => {
    if (project) {
      onSave(project.id, {
        name,
        description,
        status,
        startDate: startDate || undefined,
        milestones
      });
    }
  };

  const handleAddMilestone = () => {
    if (newMilestoneName.trim() && project) {
      const newMilestone: Milestone = {
        id: generateId(),
        name: newMilestoneName.trim(),
        targetDate: newMilestoneDate,
        completed: false
      };
      
      const updatedMilestones = [...milestones, newMilestone];
      setMilestones(updatedMilestones);
      onSave(project.id, { milestones: updatedMilestones });
      
      setNewMilestoneName('');
      setNewMilestoneDate('');
    }
  };

  const handleRemoveMilestone = (id: string) => {
    if (project) {
      const updatedMilestones = milestones.filter(m => m.id !== id);
      setMilestones(updatedMilestones);
      onSave(project.id, { milestones: updatedMilestones });
    }
  };

  const handleToggleMilestone = (id: string, completed: boolean) => {
    if (project) {
      const updatedMilestones = milestones.map(m => 
        m.id === id ? { ...m, completed } : m
      );
      setMilestones(updatedMilestones);
      onSave(project.id, { milestones: updatedMilestones });
    }
  };

  if (!isOpen || !project) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className={` ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div 
        ref={sidebarRef}
        className={`fixed top-0 right-0 h-full w-[40%] z-50 overflow-y-auto transition-transform duration-300 transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } ${theme === 'dark' ? 'bg-background/95' : 'bg-background'} border-l ${
          theme === 'dark' ? 'border-white/10' : 'border-gray-200'
        } shadow-xl backdrop-blur-sm`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Edit Project</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className={`${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Label htmlFor="name" className="min-w-[100px]">Project Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 border-0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="resize-none border-0"
              />
            </div>

            <div className="flex items-center gap-4">
              <Label htmlFor="status" className="min-w-[100px]">Status</Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as Project['status'])}
                className="flex-1 p-2 rounded-md border-0"
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
              <Label htmlFor="startDate" className="min-w-[100px]">Start Date</Label>
              <div className="flex-1 relative">
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full cursor-pointer border-0"
                  onClick={(e) => {
                    const input = e.target as HTMLInputElement;
                    input.showPicker();
                  }}
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Milestones</Label>
              <div className="space-y-4">
                {milestones.map((milestone) => (
                  <div 
                    key={milestone.id} 
                    className={`p-3 rounded-md flex items-start justify-between ${
                      theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={milestone.completed}
                          onChange={(e) => handleToggleMilestone(milestone.id, e.target.checked)}
                          className="h-4 w-4"
                        />
                        <span className={milestone.completed ? 'line-through opacity-70' : ''}>
                          {milestone.name}
                        </span>
                      </div>
                      <div className="text-xs opacity-70">
                        Target: {milestone.targetDate || 'No date set'}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveMilestone(milestone.id)}
                      className={`h-6 w-6 ${
                        theme === 'dark' ? 'hover:bg-red-900/30' : 'hover:bg-red-100'
                      } text-red-500`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="New milestone"
                    value={newMilestoneName}
                    onChange={(e) => setNewMilestoneName(e.target.value)}
                    className="flex-1 border-0"
                  />
                  <Input
                    type="date"
                    value={newMilestoneDate}
                    onChange={(e) => setNewMilestoneDate(e.target.value)}
                    className="w-40 cursor-pointer border-0"
                    onClick={(e) => {
                      const input = e.target as HTMLInputElement;
                      input.showPicker();
                    }}
                  />
                </div>
                <Button 
                  onClick={handleAddMilestone}
                  disabled={!newMilestoneName.trim()}
                  className={`w-full ${
                    theme === 'dark' 
                      ? 'bg-white/10 hover:bg-white/20 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Milestone
                </Button>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button 
                onClick={handleSave}
                className={`flex-1 ${
                  theme === 'dark' 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-blue-500 hover:bg-blue-600'
                } text-white`}
              >
                Save Changes
              </Button>
              <Button 
                onClick={() => {
                  if (confirm('Are you sure you want to delete this project?')) {
                    onDelete(project.id);
                    onClose();
                  }
                }}
                className={`${
                  theme === 'dark' 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-red-500 hover:bg-red-600'
                } text-white`}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectSidebar; 