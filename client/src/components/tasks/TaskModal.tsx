import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FileText, Paperclip, StickyNote, Upload, X, File, Image, Video } from 'lucide-react';
import { useTask, useCreateTask, useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { attachmentsApi } from '@/services/api';
import NotesDisplay from '@/components/notes/NotesDisplay';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { formatInputDateTime } from '@/utils/date';

interface TaskModalProps {
  taskId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

interface TaskFormData {
  title: string;
  description: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'done';
}

const TaskModal: React.FC<TaskModalProps> = ({ taskId, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'attachments' | 'notes'>('details');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [notes, setNotes] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { data: task, isLoading } = useTask(taskId || '');
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<TaskFormData>();

  const isEditing = !!taskId;

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description || '',
        due_date: task.due_date ? formatInputDateTime(new Date(task.due_date)) : '',
        priority: task.priority,
        status: task.status,
      });
    } else {
      reset({
        title: '',
        description: '',
        due_date: '',
        priority: 'medium',
        status: 'todo',
      });
    }
  }, [task, reset]);

  const onSubmit = async (data: TaskFormData) => {
    try {
      console.log('Form submitted with data:', data);
      const taskData = {
        ...data,
        due_date: data.due_date ? new Date(data.due_date).toISOString() : undefined,
      };
      console.log('Processed task data:', taskData);

      let createdTaskId = taskId;

      if (isEditing && taskId) {
        console.log('Updating task:', taskId);
        await updateTaskMutation.mutateAsync({ id: taskId, data: taskData });
      } else {
        console.log('Creating new task');
        const response = await createTaskMutation.mutateAsync(taskData);
        createdTaskId = response.data.data?.id || null;

        // Only upload attachments when creating a new task
        if (attachments.length > 0 && createdTaskId) {
          console.log('Uploading attachments for new task:', createdTaskId);
          for (const file of attachments) {
            try {
              await attachmentsApi.uploadAttachment(createdTaskId, file);
              console.log('Uploaded attachment:', file.name);
            } catch (error) {
              console.error('Failed to upload attachment:', file.name, error);
              // Continue with other attachments even if one fails
            }
          }
          // Clear attachments after successful upload
          setAttachments([]);
        }
      }

      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
      // Error handling is done in the mutation hooks
    }
  };

  const handleDelete = async () => {
    if (taskId && window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTaskMutation.mutateAsync(taskId);
        onClose();
      } catch (error) {
        // Error handling is done in the mutation hook
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      // Check file type
      const isValidType = file.type.startsWith('image/') ||
                         file.type.startsWith('video/') ||
                         file.type === 'application/pdf';

      // Check file size (max 10MB)
      const isValidSize = file.size <= 10 * 1024 * 1024;

      if (!isValidType) {
        alert(`${file.name} is not a supported file type. Please upload images, videos, or PDFs.`);
        return false;
      }

      if (!isValidSize) {
        alert(`${file.name} is too large. Maximum file size is 10MB.`);
        return false;
      }

      return true;
    });

    setAttachments(prev => [...prev, ...validFiles]);

    // Reset input
    if (event.target) {
      event.target.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (file.type.startsWith('video/')) return <Video className="w-4 h-4" />;
    if (file.type === 'application/pdf') return <File className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUploadAttachments = async () => {
    if (!taskId || attachments.length === 0) return;

    try {
      // Upload attachments logic here
      const formData = new FormData();
      attachments.forEach((file) => {
        formData.append('attachments', file);
      });

      // Upload each attachment individually
      for (const file of attachments) {
        await attachmentsApi.uploadAttachment(taskId, file);
      }

      // Clear attachments after successful upload
      setAttachments([]);

      // Show success message
      alert('Attachments uploaded successfully!');
    } catch (error) {
      console.error('Error uploading attachments:', error);
      alert('Failed to upload attachments. Please try again.');
    }
  };

  const handleSaveNotes = async () => {
    if (!taskId) return;

    try {
      // TODO: Implement proper notes/journal API
      // For now, just show a message that this feature is coming soon
      alert('Notes saving feature is coming soon! Notes are currently stored locally.');
    } catch (error) {
      console.error('Error saving notes:', error);
      alert('Failed to save notes. Please try again.');
    }
  };

  const tabs = [
    { id: 'details', label: 'Details', icon: FileText },
    { id: 'attachments', label: 'Attachments', icon: Paperclip },
    { id: 'notes', label: 'Notes', icon: StickyNote },
  ];

  if (isLoading && isEditing) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Loading...">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Task' : 'Create New Task'}
      size="lg"
    >
      <div className="space-y-6">
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-dark-700">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.id === 'attachments' && task?.attachments?.length && (
                  <Badge variant="secondary" size="sm">
                    {task.attachments.length}
                  </Badge>
                )}
                {tab.id === 'journals' && task?.journals?.length && (
                  <Badge variant="secondary" size="sm">
                    {task.journals.length}
                  </Badge>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'details' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Title"
                  {...register('title', { required: 'Title is required' })}
                  error={errors.title?.message}
                  placeholder="Enter task title..."
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter task description..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Due Date"
                    type="datetime-local"
                    {...register('due_date')}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Priority
                    </label>
                    <select
                      {...register('priority')}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      {...register('status')}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <div>
                    {isEditing && (
                      <Button
                        type="button"
                        variant="danger"
                        onClick={handleDelete}
                        isLoading={deleteTaskMutation.isLoading}
                      >
                        Delete Task
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      isLoading={createTaskMutation.isLoading || updateTaskMutation.isLoading}
                      disabled={isEditing && !isDirty}
                    >
                      {isEditing ? 'Update Details' : 'Create Task'}
                    </Button>
                  </div>
                </div>
              </form>
            </motion.div>
          )}

          {activeTab === 'attachments' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-pink-400 dark:hover:border-pink-500 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-2">
                  Drag and drop files here, or{' '}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-pink-600 dark:text-pink-400 hover:underline"
                  >
                    browse
                  </button>
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Supports: Images, Videos, PDFs (Max 10MB each)
                </p>
              </div>

              {/* Attachments List */}
              {attachments.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    Attachments ({attachments.length})
                  </h4>
                  <div className="space-y-2">
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          {getFileIcon(file)}
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Attachments Button */}
              {isEditing && (
                <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-dark-700">
                  <Button
                    type="button"
                    onClick={handleUploadAttachments}
                    isLoading={false}
                    className="flex items-center"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Attachments
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'notes' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Notes Editor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes & Links
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes, links, or any additional information about this task...

Examples:
• https://docs.example.com/api
• Meeting notes from 2024-01-15
• Blocked by: waiting for approval"
                    rows={10}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 resize-none font-mono text-sm"
                  />
                </div>

                {/* Notes Preview */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Preview
                  </label>
                  <div className="w-full min-h-[240px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <NotesDisplay content={notes} />
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="mb-2">💡 <strong>Tips:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>URLs will automatically become clickable links in the preview</li>
                  <li>Include meeting notes or discussion points</li>
                  <li>Track progress updates and blockers</li>
                  <li>Add context that might be helpful later</li>
                </ul>
              </div>

              {/* Save Notes Button */}
              {isEditing && (
                <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-dark-700">
                  <Button
                    type="button"
                    onClick={handleSaveNotes}
                    isLoading={false}
                    className="flex items-center"
                  >
                    <StickyNote className="w-4 h-4 mr-2" />
                    Save Notes
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default TaskModal;
