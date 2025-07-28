import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Circle } from 'lucide-react';
import { Task } from '@/types';
import { useUpdateTask } from '@/hooks/useTasks';
import TaskCard from './TaskCard';
import Card from '@/components/ui/Card';
import { toast } from 'react-hot-toast';

interface KanbanBoardProps {
  tasks: Task[];
  onEditTask: (taskId: string) => void;
}

const columns = [
  {
    id: 'todo',
    title: 'To Do',
    color: 'bg-gray-100 dark:bg-gray-800',
    icon: Circle,
    iconColor: 'text-gray-500'
  },
  {
    id: 'in_progress',
    title: 'In Progress',
    color: 'bg-blue-100 dark:bg-blue-900/20',
    icon: Clock,
    iconColor: 'text-blue-500'
  },
  {
    id: 'done',
    title: 'Done',
    color: 'bg-green-100 dark:bg-green-900/20',
    icon: CheckCircle,
    iconColor: 'text-green-500'
  },
];

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, onEditTask }) => {
  const updateTaskMutation = useUpdateTask();
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  // Debug: Log tasks on render
  React.useEffect(() => {
    console.log('📋 KanbanBoard rendered with tasks:', tasks.length);
    console.log('Tasks by status:', {
      todo: tasks.filter(t => t.status === 'todo').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      done: tasks.filter(t => t.status === 'done').length,
    });
  }, [tasks]);

  const handleDragStart = (start: any) => {
    console.log('🚀 Drag started:', start.draggableId);
    setDraggedTaskId(start.draggableId);
  };

  const handleDragEnd = (result: DropResult) => {
    console.log('🎯 Drag ended:', result);
    const { destination, source, draggableId } = result;
    setDraggedTaskId(null);

    if (!destination) {
      console.log('❌ No destination - drag cancelled');
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      console.log('❌ Same position - no change needed');
      return;
    }

    const newStatus = destination.droppableId as Task['status'];
    const task = tasks.find(t => t.id === draggableId);

    if (!task) {
      console.log('❌ Task not found:', draggableId);
      return;
    }

    console.log('✅ Moving task:', task.title, 'from', source.droppableId, 'to', newStatus);

    // Show immediate feedback
    const statusLabels = {
      'todo': 'To Do',
      'in_progress': 'In Progress',
      'done': 'Done'
    };

    toast.success(`Task moved to ${statusLabels[newStatus]}`, {
      duration: 2000,
      icon: '🚀',
    });

    updateTaskMutation.mutate({
      id: draggableId,
      data: { status: newStatus },
    });
  };

  const getTasksByStatus = (status: Task['status']) => {
    return tasks.filter(task => task.status === status);
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-3 md:p-4"
      >
        <div className="flex items-center space-x-2 text-xs md:text-sm text-primary-700 dark:text-primary-300">
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            🚀
          </motion.div>
          <span className="font-medium">
            <span className="hidden sm:inline">Drag tasks between columns to update their status • Double-click to edit</span>
            <span className="sm:hidden">Drag to move • Double-tap to edit</span>
          </span>
        </div>
      </motion.div>

      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 drag-container">
        {columns.map((column) => (
          <motion.div
            key={column.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className={`p-3 md:p-4 ${column.color} min-h-[400px] md:min-h-[600px] transition-all duration-300 ease-in-out`}>
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <div className="flex items-center space-x-1.5 md:space-x-2">
                  <column.icon className={`w-4 h-4 md:w-5 md:h-5 ${column.iconColor}`} />
                  <h3 className="font-semibold text-sm md:text-base text-gray-900 dark:text-gray-100">
                    {column.title}
                  </h3>
                </div>
                <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-dark-700 px-2 py-1 rounded-full font-medium">
                  {getTasksByStatus(column.id as Task['status']).length}
                </span>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-2 md:space-y-3 min-h-[300px] md:min-h-[500px] drop-zone rounded-lg p-1 ${
                      snapshot.isDraggingOver
                        ? 'drag-over'
                        : 'hover:bg-gray-50/50 dark:hover:bg-gray-800/30'
                    }`}
                  >
                    {getTasksByStatus(column.id as Task['status']).map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`drag-item ${
                              snapshot.isDragging
                                ? 'dragging'
                                : draggedTaskId === task.id
                                ? 'opacity-60 scale-95'
                                : ''
                            }`}
                          >
                            <div {...provided.dragHandleProps} className="task-fade-in">
                              <TaskCard
                                task={task}
                                onEdit={() => onEditTask(task.id)}
                                isDragging={snapshot.isDragging}
                              />
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}

                    {getTasksByStatus(column.id as Task['status']).length === 0 && (
                      <motion.div
                        className={`flex flex-col items-center justify-center h-24 md:h-32 text-gray-400 dark:text-gray-600 text-xs md:text-sm border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg transition-all duration-300 ease-in-out ${
                          snapshot.isDraggingOver
                            ? 'border-primary-400 text-primary-500 bg-primary-50 dark:bg-primary-900/10 scale-105 shadow-lg'
                            : 'hover:border-gray-400 dark:hover:border-gray-500'
                        }`}
                        initial={{ opacity: 0.6, scale: 1 }}
                        animate={{
                          opacity: snapshot.isDraggingOver ? 1 : 0.6,
                          scale: snapshot.isDraggingOver ? 1.05 : 1
                        }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                      >
                        <motion.div
                          animate={{
                            scale: snapshot.isDraggingOver ? [1, 1.05, 1] : 1,
                            rotate: snapshot.isDraggingOver ? [0, 3, -3, 0] : 0
                          }}
                          transition={{
                            duration: 0.6,
                            repeat: snapshot.isDraggingOver ? Infinity : 0,
                            ease: "easeInOut"
                          }}
                        >
                          <column.icon className={`w-6 h-6 md:w-8 md:h-8 mb-1 md:mb-2 transition-colors duration-200 ${snapshot.isDraggingOver ? 'text-primary-500' : column.iconColor}`} />
                        </motion.div>
                        <span className="font-medium text-center px-2">
                          {snapshot.isDraggingOver ? 'Drop here' : `No ${column.title.toLowerCase()} tasks`}
                        </span>
                      </motion.div>
                    )}
                  </div>
                )}
              </Droppable>
            </Card>
          </motion.div>
        ))}
      </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;
