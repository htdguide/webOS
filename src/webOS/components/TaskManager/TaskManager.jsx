// src/components/TaskManager/TaskManager.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

// Context so that any part of the app can open/close tasks
const TaskManagerContext = createContext();

/**
 * Custom hook to access TaskManager's openTask/closeTask
 */
export const useTaskManager = () => {
  return useContext(TaskManagerContext);
};

// Simple counter to generate unique task IDs
let nextTaskSequence = 1;

/**
 * TaskManagerProvider wraps your entire React tree. It:
 *  - Keeps an array of "tasks" in its state. Each task is an object:
 *      { taskId: string, appConfig: { id, name, icon, component, ... } }
 *  - Exposes openTask(appConfig) to add a new task to state
 *  - Exposes closeTask(taskId) to remove a specific task
 *  - Renders a <TaskWindow> for every task entry via React Portal
 */
export function TaskManagerProvider({ children }) {
  const [tasks, setTasks] = useState([]);

  /**
   * Always creates a fresh new task instance, even if one already exists for the same app.
   * Generates a unique taskId and returns it.
   */
  const openTask = (appConfig) => {
    const taskId = `${appConfig.id}-${nextTaskSequence++}`;
    setTasks((prev) => [...prev, { taskId, appConfig }]);
    return taskId;
  };

  /**
   * Removes the task with the given taskId from state.
   */
  const closeTask = (taskId) => {
    setTasks((prev) => prev.filter((t) => t.taskId !== taskId));
  };

  return (
    <TaskManagerContext.Provider value={{ openTask, closeTask }}>
      {children}
      {tasks.map((task) => (
        <TaskWindow
          key={task.taskId}
          task={task}
          onClose={() => closeTask(task.taskId)}
        />
      ))}
    </TaskManagerContext.Provider>
  );
}

/**
 * TaskWindow is responsible for rendering a single task (app instance) into its own
 * <div> appended to document.body via ReactDOM.createPortal. Each window must have a
 * unique “title” so that the DraggableWindow system can treat it as a separate window.
 *
 * We pass:
 *  - taskId: the unique ID (e.g. "noterminal-1")
 *  - onClose: callback to remove this task from TaskManager
 *  - windowTitle: pass down as a prop so the app uses a unique title in DraggableWindow
 */
function TaskWindow({ task, onClose }) {
  const { appConfig, taskId } = task;
  const AppComponent = appConfig.component;

  // Create a container <div> for this window
  const [container] = useState(() => document.createElement('div'));

  useEffect(() => {
    document.body.appendChild(container);
    return () => {
      document.body.removeChild(container);
    };
  }, [container]);

  // Decide on a unique title string. Here, we use the taskId itself (e.g. "noterminal-1")
  const windowTitle = taskId;

  // Render the chosen app component into the container via a portal.
  // We forward both taskId and windowTitle, plus onClose.
  const element = (
    <AppComponent
      taskId={taskId}
      windowTitle={windowTitle}
      onClose={onClose}
    />
  );

  return ReactDOM.createPortal(element, container);
}
