import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";
import { useTheme } from '../context/ThemeContext';
import { type Project, type Milestone } from '../hooks/useProjects';

interface ProjectDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (project: Omit<Project, 'id'>) => void;
  project?: Project;
  mode: 'add' | 'edit';
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const ProjectDialog: React.FC<ProjectDialogProps> = ({
  open,
  onClose,
  onSave,
  project,
  mode
}) => {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Project['status']>('Not Started');
  const [startDate, setStartDate] = useState('');
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [newMilestoneName, setNewMilestoneName] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('');

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description);
      setStatus(project.status);
      setStartDate(project.startDate || '');
      setMilestones(project.milestones || []);
    } else {
      setName('');
      setDescription('');
      setStatus('Not Started');
      setStartDate('');
      setMilestones([]);
    }
  }, [project]);

  const handleAddMilestone = () => {
    if (newMilestoneName && newMilestoneDate) {
      setMilestones([
        ...milestones,
        {
          id: generateId(),
          name: newMilestoneName,
          targetDate: newMilestoneDate,
          completed: false
        }
      ]);
      setNewMilestoneName('');
      setNewMilestoneDate('');
    }
  };

  const handleRemoveMilestone = (id: string) => {
    setMilestones(milestones.filter(m => m.id !== id));
  };

  const handleSave = () => {
    onSave({
      name,
      description,
      status,
      startDate: startDate || undefined,
      milestones
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-[425px] ${
        theme === 'dark' 
          ? 'bg-zinc-950 text-white' 
          : 'bg-white text-gray-900'
      }`}>
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Add Project' : 'Edit Project'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-50'}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-50'}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={status}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatus(e.target.value as Project['status'])}
              className={`${
                theme === 'dark' 
                  ? 'bg-zinc-900 border-zinc-800' 
                  : 'bg-gray-50 border-gray-200'
              } border rounded-md p-2`}
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-50'}
            />
          </div>
          <div className="grid gap-2">
            <Label>Milestones</Label>
            <div className="space-y-2">
              {milestones.map((milestone) => (
                <div key={milestone.id} className={`flex items-center gap-2 ${
                  theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-50'
                } p-2 rounded-md`}>
                  <div className="flex-1">
                    <div className="font-medium">{milestone.name}</div>
                    <div className={`text-sm ${
                      theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'
                    }`}>
                      {new Date(milestone.targetDate).toLocaleDateString()}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveMilestone(milestone.id)}
                    className={`h-8 w-8 text-destructive ${
                      theme === 'dark' ? 'hover:bg-destructive/10' : 'hover:bg-destructive/20'
                    }`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  placeholder="Milestone name"
                  value={newMilestoneName}
                  onChange={(e) => setNewMilestoneName(e.target.value)}
                  className={theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-50'}
                />
                <Input
                  type="date"
                  value={newMilestoneDate}
                  onChange={(e) => setNewMilestoneDate(e.target.value)}
                  className={theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-50'}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleAddMilestone}
                  disabled={!newMilestoneName || !newMilestoneDate}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name}>
            {mode === 'add' ? 'Create' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDialog; 