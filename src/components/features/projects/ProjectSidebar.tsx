import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Trash2, Calendar, ClipboardList, AlignLeft, Sparkles } from "lucide-react";
import { useTheme } from '@/context/ThemeContext';
import { type Project, type Milestone } from '@/hooks/useProjects';
import { generateProjectMilestones, type MilestoneType } from "@/utils/agents";
import { MilestoneReviewSlide } from '@/components/MilestoneReviewSlide';

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project;
  milestones: Milestone[];
  onSave: (projectId: string, updates: Partial<Project>) => void;
  onDelete: (id: string) => void;
  onAddMilestone: (projectId: string, milestoneData: Omit<Milestone, 'id' | 'projectId'>) => Promise<Milestone>;
  onUpdateMilestone: (id: string, milestoneData: Partial<Milestone>) => void;
  onDeleteMilestone: (id: string) => void;
}

export const ProjectSidebar: React.FC<ProjectSidebarProps> = ({
  isOpen,
  onClose,
  project,
  milestones,
  onSave,
  onDelete,
  onAddMilestone,
  onUpdateMilestone,
  onDeleteMilestone
}) => {
  const { theme } = useTheme();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Project['status']>('Not Started');
  const [startDate, setStartDate] = useState('');
  const [completedDate, setCompletedDate] = useState('');
  const [newMilestoneName, setNewMilestoneName] = useState('');
  const [newMilestoneDueDate, setNewMilestoneDueDate] = useState('');
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [isGeneratingMilestones, setIsGeneratingMilestones] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [showCustomPromptForm, setShowCustomPromptForm] = useState(false);
  const [showReviewSlide, setShowReviewSlide] = useState(false);
  const [generatedMilestones, setGeneratedMilestones] = useState<MilestoneType[]>([]);
  const [useAI, setUseAI] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const isProjectCard = target.closest('.project-card-container');

      // Don't close if the review slide is open
      if (showReviewSlide) return;

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
  }, [isOpen, onClose, showReviewSlide]);

  useEffect(() => {
    if (project) {
      setTitle(project.title);
      setDescription(project.description);
      setStatus(project.status);
      setStartDate(project.startDate || '');
      setCompletedDate(project.completedDate || '');
      setUseAI(project.useAI || false);
    }
  }, [project]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (project) {
      onSave(project.id, {
        ...project,
        title: e.target.value
      });
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    if (project) {
      onSave(project.id, {
        ...project,
        description: e.target.value
      });
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as Project['status'];
    setStatus(newStatus);
    if (project) {
      onSave(project.id, {
        ...project,
        status: newStatus
      });
    }
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
    if (project) {
      onSave(project.id, {
        ...project,
        startDate: e.target.value || undefined
      });
    }
  };

  const handleCompletedDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompletedDate(e.target.value);
    if (project) {
      onSave(project.id, {
        ...project,
        completedDate: e.target.value
      });
    }
  };

  const handleUseAICheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUseAI(e.target.checked);
    if (project) {
      onSave(project.id, {
        ...project,
        useAI: e.target.checked
      });
    }
  };

  const handleAddMilestone = () => {
    if (newMilestoneName.trim() && project) {
      onAddMilestone(project.id, {
        name: newMilestoneName.trim(),
        status: 'Not Started',
        dueDate: newMilestoneDueDate || new Date().toISOString().split('T')[0]
      });

      setNewMilestoneName('');
      setNewMilestoneDueDate('');
      setShowMilestoneForm(false);
    }
  };

  const handleToggleMilestone = (id: string, completed: boolean) => {
    const status = completed ? 'Completed' : 'In Progress';
    onUpdateMilestone(id, { status });
  };

  const handleGenerateMilestones = async () => {
    if (!project) return;
    
    try {
      setIsGeneratingMilestones(true);
      
      const milestones = await generateProjectMilestones({
        title: project.title,
        description: project.description,
        status: project.status,
        startDate: project.startDate || '',
        prompt: customPrompt || undefined
      });
      
      // Store the generated milestones for review
      setGeneratedMilestones(milestones);
      
      // Show the review slide
      setShowReviewSlide(true);
      setShowCustomPromptForm(false);
      setCustomPrompt('');
    } catch (error) {
      console.error('Error generating milestones:', error);
      alert('Failed to generate milestones. Please try again.');
    } finally {
      setIsGeneratingMilestones(false);
    }
  };

  const handleApproveMilestones = (approvedMilestones: Array<Omit<Milestone, 'id' | 'projectId'>>) => {
    if (!project) return;
    
    // Add each approved milestone to the project with a small delay to ensure unique IDs
    const addMilestonesSequentially = async () => {
      let addedCount = 0;
      const createdMilestoneIds: Record<number, string> = {};
      
      for (let i = 0; i < approvedMilestones.length; i++) {
        const milestone = approvedMilestones[i];
        // Add a small delay to ensure unique timestamps for IDs
        await new Promise(resolve => setTimeout(resolve, 10));
        
        try {
          // Add the milestone and get its ID
          const newMilestone = await onAddMilestone(project.id, milestone);
          createdMilestoneIds[i] = newMilestone.id;
          addedCount++;
        } catch (error) {
          console.error('Error adding milestone:', error);
        }
      }
      
      // Show success message
      alert(`Successfully added ${addedCount} milestones to your project!`);
      
      // Return the created milestone IDs
      return createdMilestoneIds;
    };
    
    // Execute the async function
    addMilestonesSequentially().catch(error => {
      console.error('Error adding milestones:', error);
      alert('An error occurred while adding milestones. Please try again.');
    });
  };

  if (!isOpen || !project) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={` ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 right-0 h-full w-[40%] z-50 overflow-y-auto transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'
          } ${theme === 'dark' ? 'bg-background/95' : 'bg-background'} border-l ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'
          } shadow-xl backdrop-blur-sm`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <Input
              value={title}
              onChange={handleTitleChange}
              className="mt-6 font-semibold bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto w-full text-3xl md:text-2xl"
              placeholder="Project Name"
            />
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
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlignLeft className="h-4 w-4" />
                <Label htmlFor="description" className="font-normal font-[ui-sans-serif,_-apple-system,_BlinkMacSystemFont,_'Segoe_UI_Variable_Display',_'Segoe_UI',_Helvetica,_'Apple_Color_Emoji',_Arial,_sans-serif,_'Segoe_UI_Emoji',_'Segoe_UI_Symbol']">Description</Label>
              </div>
              <Textarea
                id="description"
                value={description}
                onChange={handleDescriptionChange}
                rows={4}
                className="resize-y min-h-[100px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 font-mono"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 min-w-[100px]">
                <ClipboardList className="h-4 w-4" />
                <Label htmlFor="status" className="font-normal font-[ui-sans-serif,_-apple-system,_BlinkMacSystemFont,_'Segoe_UI_Variable_Display',_'Segoe_UI',_Helvetica,_'Apple_Color_Emoji',_Arial,_sans-serif,_'Segoe_UI_Emoji',_'Segoe_UI_Symbol']">Status</Label>
              </div>
              <select
                id="status"
                value={status}
                onChange={handleStatusChange}
                className="flex-1 p-2 rounded-md border-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Use AI Assistant Checkbox */}
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="useAI"
                checked={useAI}
                onChange={handleUseAICheckbox}
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

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 min-w-[100px]">
                <Calendar className="h-4 w-4" />
                <Label htmlFor="startDate" className="font-normal font-[ui-sans-serif,_-apple-system,_BlinkMacSystemFont,_'Segoe_UI_Variable_Display',_'Segoe_UI',_Helvetica,_'Apple_Color_Emoji',_Arial,_sans-serif,_'Segoe_UI_Emoji',_'Segoe_UI_Symbol']">Start Date</Label>
              </div>
              <div 
                className="flex-1 relative cursor-pointer border rounded-md overflow-hidden"
                onClick={(e) => {
                  const input = document.getElementById('startDate') as HTMLInputElement;
                  if (input) input.showPicker();
                }}
              >
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={handleStartDateChange}
                  className="w-full cursor-pointer border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            </div>
            {/* Completed Date - only show if status is Completed */}
            {status === 'Completed' && (
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2 min-w-[100px]">
                  <Calendar className="h-4 w-4" />
                  <Label htmlFor="completedDate" className="font-normal font-[ui-sans-serif,_-apple-system,_BlinkMacSystemFont,_'Segoe_UI_Variable_Display',_'Segoe_UI',_Helvetica,_'Apple_Color_Emoji',_Arial,_sans-serif,_'Segoe_UI_Emoji',_'Segoe_UI_Symbol']">Completed Date</Label>
                </div>
                <div
                  className="flex-1 relative cursor-pointer border rounded-md overflow-hidden"
                  onClick={(e) => {
                    const input = document.getElementById('completedDate') as HTMLInputElement;
                    if (input) input.showPicker();
                  }}
                >
                  <Input
                    id="completedDate"
                    type="date"
                    value={completedDate}
                    onChange={handleCompletedDateChange}
                    className="w-full cursor-pointer border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-medium font-[ui-sans-serif,_-apple-system,_BlinkMacSystemFont,_'Segoe_UI_Variable_Display',_'Segoe_UI',_Helvetica,_'Apple_Color_Emoji',_Arial,_sans-serif,_'Segoe_UI_Emoji',_'Segoe_UI_Symbol']">Milestones</Label>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`px-2 py-1 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                    {milestones.length} total
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 rounded-full"
                    onClick={() => setShowMilestoneForm(!showMilestoneForm)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 p-0 rounded-full flex items-center gap-1 px-2"
                    onClick={() => setShowCustomPromptForm(!showCustomPromptForm)}
                    disabled={isGeneratingMilestones}
                  >
                    <Sparkles className="h-3 w-3" />
                    <span className="text-xs">Generate</span>
                  </Button>
                </div>
              </div>
              
              {showCustomPromptForm && (
                <div className="p-4 rounded-md border border-dashed border-gray-300 dark:border-gray-700 mb-4 transition-all duration-300 ease-in-out transform origin-top">
                  <h4 className="text-sm font-medium mb-2">Generate Milestones with AI</h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="customPrompt" className="text-xs font-[ui-sans-serif,_-apple-system,_BlinkMacSystemFont,_'Segoe_UI_Variable_Display',_'Segoe_UI',_Helvetica,_'Apple_Color_Emoji',_Arial,_sans-serif,_'Segoe_UI_Emoji',_'Segoe_UI_Symbol']">Custom Instructions (Optional)</Label>
                      <Textarea
                        id="customPrompt"
                        placeholder="Add any specific instructions for milestone generation..."
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        className="mt-1 resize-y min-h-[80px] text-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleGenerateMilestones}
                        disabled={isGeneratingMilestones || !project.title}
                        className="flex-1"
                      >
                        {isGeneratingMilestones ? (
                          <>
                            <span className="animate-spin mr-2">⏳</span>
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Generate Milestones
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowCustomPromptForm(false)}
                        disabled={isGeneratingMilestones}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {showMilestoneForm && (
                <div className="p-4 rounded-md border border-dashed border-gray-300 dark:border-gray-700 mb-4 transition-all duration-300 ease-in-out transform origin-top">
                  <h4 className="text-sm font-medium mb-2">Add New Milestone</h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="milestoneName" className="text-xs font-[ui-sans-serif,_-apple-system,_BlinkMacSystemFont,_'Segoe_UI_Variable_Display',_'Segoe_UI',_Helvetica,_'Apple_Color_Emoji',_Arial,_sans-serif,_'Segoe_UI_Emoji',_'Segoe_UI_Symbol']">Name</Label>
                      <Input
                        id="milestoneName"
                        placeholder="Milestone name"
                        value={newMilestoneName}
                        onChange={(e) => setNewMilestoneName(e.target.value)}
                        className="mt-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                        autoFocus
                      />
                    </div>
                    <div>
                      <Label htmlFor="milestoneDueDate" className="text-xs font-[ui-sans-serif,_-apple-system,_BlinkMacSystemFont,_'Segoe_UI_Variable_Display',_'Segoe_UI',_Helvetica,_'Apple_Color_Emoji',_Arial,_sans-serif,_'Segoe_UI_Emoji',_'Segoe_UI_Symbol']">Due Date</Label>
                      <div 
                        className="mt-1 relative cursor-pointer border rounded-md overflow-hidden"
                        onClick={(e) => {
                          const input = document.getElementById('milestoneDueDate') as HTMLInputElement;
                          if (input) input.showPicker();
                        }}
                      >
                        <Input
                          id="milestoneDueDate"
                          type="date"
                          value={newMilestoneDueDate}
                          onChange={(e) => setNewMilestoneDueDate(e.target.value)}
                          className="border-0 cursor-pointer focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleAddMilestone}
                        disabled={!newMilestoneName.trim()}
                        className="flex-1"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Milestone
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowMilestoneForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                {milestones.length === 0 ? (
                  <div className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
                    {showMilestoneForm 
                      ? "Fill out the form above to add your first milestone." 
                      : showCustomPromptForm
                        ? "Use AI to generate milestones based on your project details."
                        : "No milestones yet. Click the + button to add one or use AI to generate them."}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {milestones.map((milestone) => (
                      <div
                        key={milestone.id}
                        className={`p-3 rounded-md flex items-start justify-between ${
                          theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                        } hover:bg-opacity-80 transition-colors`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={milestone.status === 'Completed'}
                              onChange={(e) => handleToggleMilestone(milestone.id, e.target.checked)}
                              className="h-4 w-4"
                            />
                            <span className={`font-medium ${milestone.status === 'Completed' ? 'line-through opacity-70' : ''}`}>
                              {milestone.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs opacity-70">
                            <span className="inline-flex items-center">
                              <Badge variant={milestone.status === 'Completed' ? 'secondary' : 'default'} className="text-[10px] h-4">
                                {milestone.status}
                              </Badge>
                            </span>
                            <span>•</span>
                            <span>Due: {milestone.dueDate || 'No date set'}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteMilestone(milestone.id)}
                          className={`h-6 w-6 ${theme === 'dark' ? 'hover:bg-red-900/30' : 'hover:bg-red-100'
                            } text-red-500`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button
                variant="destructive"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this project?')) {
                    onDelete(project.id);
                    onClose();
                  }
                }}
              >
                Delete Project
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Milestone Review Slide */}
      <MilestoneReviewSlide
        isOpen={showReviewSlide}
        onClose={() => setShowReviewSlide(false)}
        projectId={project.id}
        generatedMilestones={generatedMilestones}
        onApproveMilestones={handleApproveMilestones}
      />
    </>
  );
};
