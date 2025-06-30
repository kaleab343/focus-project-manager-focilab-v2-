import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTheme } from '@/context/ThemeContext';
import { type Project } from '@/hooks/useProjects';

interface ProjectDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (project: Omit<Project, 'id'> & { completedDate?: string }) => void;
  project?: Project & { completedDate?: string };  // optional completedDate added
  mode: 'add' | 'edit';
}

export const ProjectDialog: React.FC<ProjectDialogProps> = ({
  open,
  onClose,
  onSave,
  project,
  mode
}) => {
  const { theme } = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Project['status']>('Not Started');
  const [startDate, setStartDate] = useState('');
  const [completedDate, setCompletedDate] = useState(''); // New state
  const [useAI, setUseAI] = useState(false); // AI Assistant state

  useEffect(() => {
    if (project) {
      setTitle(project.title);
      setDescription(project.description);
      setStatus(project.status);
      setStartDate(project.startDate || '');
      setCompletedDate(project.completedDate || '');
      setUseAI(project.useAI || false);
    } else {
      setTitle('');
      setDescription('');
      setStatus('Not Started');
      setStartDate('');
      setCompletedDate('');
      setUseAI(false);
    }
  }, [project]);

  // When status changes to 'Completed' and completedDate empty, auto-set today
  useEffect(() => {
    if (status === 'Completed' && !completedDate) {
      setCompletedDate(new Date().toISOString().split('T')[0]);
    }
    if (status !== 'Completed') {
      setCompletedDate('');
    }
  }, [status]);

  const handleSave = () => {
    onSave({
      title,
      description,
      status,
      startDate: startDate || new Date().toISOString().split('T')[0],
      useAI,
      ...(status === 'Completed' ? { completedDate } : {})
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        style={{ zIndex: 1000 }}
        className={`sm:max-w-[425px] ${
          theme === 'dark' 
            ? 'bg-zinc-950 text-white' 
            : 'bg-white text-gray-900'
        }`}
      >
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Add Project' : 'Edit Project'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
            <Label>AI Assistant</Label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="useAI"
                checked={useAI}
                onChange={(e) => setUseAI(e.target.checked)}
                className={`w-4 h-4 rounded border-2 ${
                  theme === 'dark' 
                    ? 'bg-zinc-900 border-zinc-600 checked:bg-blue-500 checked:border-blue-500' 
                    : 'bg-white border-gray-300 checked:bg-blue-500 checked:border-blue-500'
                } focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              />
              <Label 
                htmlFor="useAI" 
                className={`text-sm cursor-pointer ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                Use AI Assistant
              </Label>
            </div>
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

          {/* Show Completed Date only if status is Completed */}
          {status === 'Completed' && (
            <div className="grid gap-2">
              <Label htmlFor="completedDate">Completed Date</Label>
              <Input
                id="completedDate"
                type="date"
                value={completedDate}
                onChange={(e) => setCompletedDate(e.target.value)}
                className={theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-50'}
              />
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title}>
            {mode === 'add' ? 'Create' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
