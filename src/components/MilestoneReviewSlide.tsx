import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Check, Trash2, Calendar, Edit, Plus } from "lucide-react";
import { useTheme } from '@/context/ThemeContext';
import { type Milestone } from '@/hooks/useProjects';
import { type TaskType } from '@/utils/agents';
import { useTodos } from '@/hooks/useTodos';

interface MilestoneReviewSlideProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  generatedMilestones: Array<{
    name: string;
    description?: string;
    dueDate?: string;
    tasks: TaskType[];
  }>;
  onApproveMilestones: (milestones: Array<Omit<Milestone, 'id' | 'projectId'>>) => void;
}

const MilestoneReviewSlide: React.FC<MilestoneReviewSlideProps> = ({
  isOpen,
  onClose,
  projectId,
  generatedMilestones,
  onApproveMilestones
}) => {
  const { theme } = useTheme();
  const slideRef = useRef<HTMLDivElement>(null);
  const { addTodo } = useTodos();
  const [editedMilestones, setEditedMilestones] = useState<Array<{
    name: string;
    description?: string;
    dueDate?: string;
    status: 'Not Started' | 'In Progress' | 'Completed';
    tasks: TaskType[];
    isEditing: boolean;
  }>>([]);
  const [createdMilestoneIds, setCreatedMilestoneIds] = useState<Record<number, string>>({});

  // Initialize edited milestones from generated ones
  useEffect(() => {
    if (generatedMilestones.length > 0) {
      setEditedMilestones(
        generatedMilestones.map(milestone => ({
          ...milestone,
          status: 'Not Started',
          isEditing: false
        }))
      );
      // Reset created milestone IDs when new milestones are generated
      setCreatedMilestoneIds({});
    }
  }, [generatedMilestones]);

  // Prevent the click outside behavior
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Only prevent default behavior to stop propagation
      event.stopPropagation();
    };

    if (isOpen && slideRef.current) {
      // Add the event listener to the slide itself
      slideRef.current.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      if (slideRef.current) {
        slideRef.current.removeEventListener('mousedown', handleClickOutside);
      }
    };
  }, [isOpen]);

  const handleToggleEdit = (index: number) => {
    setEditedMilestones(prev => 
      prev.map((milestone, i) => 
        i === index ? { ...milestone, isEditing: !milestone.isEditing } : milestone
      )
    );
  };

  const handleMilestoneChange = (index: number, field: string, value: string) => {
    setEditedMilestones(prev => 
      prev.map((milestone, i) => 
        i === index ? { ...milestone, [field]: value } : milestone
      )
    );
  };

  const handleTaskChange = (milestoneIndex: number, taskIndex: number, field: string, value: string) => {
    setEditedMilestones(prev => {
      const newMilestones = [...prev];
      const milestone = { ...newMilestones[milestoneIndex] };
      const tasks = [...milestone.tasks];
      tasks[taskIndex] = { ...tasks[taskIndex], [field]: value };
      milestone.tasks = tasks;
      newMilestones[milestoneIndex] = milestone;
      return newMilestones;
    });
  };

  const handleRemoveMilestone = (index: number) => {
    setEditedMilestones(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveTask = (milestoneIndex: number, taskIndex: number) => {
    setEditedMilestones(prev => {
      const newMilestones = [...prev];
      const milestone = { ...newMilestones[milestoneIndex] };
      milestone.tasks = milestone.tasks.filter((_, i) => i !== taskIndex);
      newMilestones[milestoneIndex] = milestone;
      return newMilestones;
    });
  };

  const handleAddTask = (milestoneIndex: number) => {
    setEditedMilestones(prev => {
      const newMilestones = [...prev];
      const milestone = { ...newMilestones[milestoneIndex] };
      milestone.tasks = [
        ...milestone.tasks,
        { id: `new-${Date.now()}`, title: 'New task', description: '' }
      ];
      newMilestones[milestoneIndex] = milestone;
      return newMilestones;
    });
  };

  const handleApprove = async () => {
    // Convert edited milestones to the format expected by onApproveMilestones
    const milestonesToApprove = editedMilestones.map(({ name, description, dueDate, status }) => ({
      name,
      description,
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      status
    }));
    
    // Call the onApproveMilestones function to add milestones to the project
    onApproveMilestones(milestonesToApprove);
    
    // Wait for milestones to be created and get their IDs
    // This is a simplified approach - in a real app, you'd want to get the actual IDs back
    // from the onApproveMilestones function
    
    // Create todos for each task in each milestone
    try {
      // We'll use a delay to ensure milestones are created before adding tasks
      setTimeout(async () => {
        let tasksAdded = 0;
        
        for (let i = 0; i < editedMilestones.length; i++) {
          const milestone = editedMilestones[i];
          
          // For each task in the milestone, create a todo
          for (const task of milestone.tasks) {
            try {
              // Add the task as a todo
              await addTodo({
                title: task.title,
                date: 'Today', // Default to today, can be changed by user later
                status: 'not-started',
              });
              
              tasksAdded++;
            } catch (error) {
              console.error('Error adding task as todo:', error);
            }
          }
        }
        
        if (tasksAdded > 0) {
          console.log(`Successfully added ${tasksAdded} tasks as todos`);
        }
      }, 500); // Small delay to ensure milestones are created first
    } catch (error) {
      console.error('Error adding tasks as todos:', error);
    }
    
    onClose();
  };

  // Update the createdMilestoneIds when new milestones are created
  const updateCreatedMilestoneId = (index: number, id: string) => {
    setCreatedMilestoneIds(prev => ({
      ...prev,
      [index]: id
    }));
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.stopPropagation()}
    >
      <div 
        ref={slideRef}
        className={`fixed top-0 left-0 h-full w-[60%] overflow-y-auto transition-transform duration-300 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${theme === 'dark' ? 'bg-background/95' : 'bg-background'} border-r ${
          theme === 'dark' ? 'border-white/10' : 'border-gray-200'
        } shadow-xl backdrop-blur-sm`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Review Generated Milestones</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className={`${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="mb-4">
            <p className="text-sm opacity-70">
              Review and edit the generated milestones and tasks before approving them. Tasks will be added to your todo list.
            </p>
          </div>

          {editedMilestones.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No milestones to review. Please generate milestones first.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 mb-6">
              {editedMilestones.map((milestone, milestoneIndex) => (
                <div 
                  key={milestoneIndex}
                  className={`border rounded-lg overflow-hidden ${
                    theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                  }`}
                >
                  <div 
                    className={`p-4 ${
                      theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        {milestone.isEditing ? (
                          <div className="space-y-3">
                            <div>
                              <Label htmlFor={`milestone-name-${milestoneIndex}`} className="text-xs">Name</Label>
                              <Input
                                id={`milestone-name-${milestoneIndex}`}
                                value={milestone.name}
                                onChange={(e) => handleMilestoneChange(milestoneIndex, 'name', e.target.value)}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`milestone-description-${milestoneIndex}`} className="text-xs">Description</Label>
                              <Textarea
                                id={`milestone-description-${milestoneIndex}`}
                                value={milestone.description || ''}
                                onChange={(e) => handleMilestoneChange(milestoneIndex, 'description', e.target.value)}
                                className="mt-1 resize-none"
                                rows={2}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`milestone-duedate-${milestoneIndex}`} className="text-xs">Due Date</Label>
                              <Input
                                id={`milestone-duedate-${milestoneIndex}`}
                                type="date"
                                value={milestone.dueDate || ''}
                                onChange={(e) => handleMilestoneChange(milestoneIndex, 'dueDate', e.target.value)}
                                className="mt-1"
                              />
                            </div>
                          </div>
                        ) : (
                          <div>
                            <h3 className="text-lg font-medium">{milestone.name}</h3>
                            {milestone.description && (
                              <p className="text-sm opacity-70 mt-1">{milestone.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {milestone.status}
                              </Badge>
                              {milestone.dueDate && (
                                <div className="flex items-center text-xs opacity-70">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {milestone.dueDate}
                                </div>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {milestone.tasks.length} tasks
                              </Badge>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleEdit(milestoneIndex)}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveMilestone(milestoneIndex)}
                          className="h-8 w-8 text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Tasks Section - Always visible */}
                    <div className="mt-3">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-medium">Tasks</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAddTask(milestoneIndex)}
                          className="h-7 text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Task
                        </Button>
                      </div>
                      
                      <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                        {milestone.tasks.length === 0 ? (
                          <div className="text-center py-2 text-sm text-gray-500">
                            No tasks for this milestone.
                          </div>
                        ) : (
                          milestone.tasks.map((task, taskIndex) => (
                            <div
                              key={task.id}
                              className={`p-2 rounded-md ${
                                theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-100/70'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <Input
                                    value={task.title}
                                    onChange={(e) => handleTaskChange(milestoneIndex, taskIndex, 'title', e.target.value)}
                                    className="border-0 bg-transparent p-0 h-auto text-sm font-medium focus-visible:ring-0"
                                    placeholder="Task title"
                                  />
                                  {task.description && (
                                    <p className="text-xs opacity-70 mt-1 pl-1">{task.description}</p>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveTask(milestoneIndex, taskIndex)}
                                  className="h-6 w-6 text-red-500 shrink-0"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleApprove}
              disabled={editedMilestones.length === 0}
              className="gap-1"
            >
              <Check className="h-4 w-4" />
              Approve Milestones & Tasks
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { MilestoneReviewSlide };
