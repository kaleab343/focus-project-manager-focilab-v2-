import { useState, useEffect, useCallback } from "react";
import supabase from "../db_api/supabase";

export interface Milestone {
  id: string;
  name: string;
  status: "Not Started" | "In Progress" | "Completed";
  dueDate: string;
  projectId: string;
  mile_id?: number; // Supabase milestone_id stored here
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: "Not Started" | "In Progress" | "Completed";
  startDate: string;
  completedDate?: string;
  supa_id?: number;
  isCurrentWork?: boolean;
  useAI?: boolean;
}

const DB_NAME = "focilab_db";
const DB_VERSION = 6;
const PROJECTS_STORE = "projects";
const MILESTONES_STORE = "milestones";

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error("IndexedDB error:", request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(PROJECTS_STORE)) {
        const store = db.createObjectStore(PROJECTS_STORE, { keyPath: "id" });
        store.createIndex("status", "status", { unique: false });
        store.createIndex("startDate", "startDate", { unique: false });
        store.createIndex("isCurrentWork", "isCurrentWork", { unique: false });
        store.createIndex("useAI", "useAI", { unique: false });
      }

      if (!db.objectStoreNames.contains(MILESTONES_STORE)) {
        const store = db.createObjectStore(MILESTONES_STORE, { keyPath: "id" });
        store.createIndex("projectId", "projectId", { unique: false });
        store.createIndex("status", "status", { unique: false });
        store.createIndex("dueDate", "dueDate", { unique: false });
      }
    };
  });
};

const dbOperation = async <T>(
  storeName: string,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    const request = operation(store);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const getSupaIdFromIndexedDB = async (id: string): Promise<number | null> => {
  try {
    const project = await dbOperation<Project>(
      PROJECTS_STORE,
      "readonly",
      (store) => store.get(id)
    );
    if (project && project.supa_id) {
      return project.supa_id;
    }
    return null;
  } catch (error) {
    console.error("Error fetching project from IndexedDB:", error);
    return null;
  }
};

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const loadedProjects = await dbOperation<Project[]>(
        PROJECTS_STORE,
        "readonly",
        (store) => store.getAll()
      );
      const loadedMilestones = await dbOperation<Milestone[]>(
        MILESTONES_STORE,
        "readonly",
        (store) => store.getAll()
      );

      setProjects(loadedProjects);
      setMilestones(loadedMilestones);
      setError(null);
    } catch (err) {
      console.error("Error loading data:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addProject = async (projectData: Omit<Project, "id">) => {
    try {
      // If status is Completed and completedDate is not provided, set it to today
      let completedDate = projectData.completedDate;
      if (projectData.status === "Completed" && !completedDate) {
        completedDate = new Date().toISOString().split('T')[0];
      }
      const supabaseInsertData: any = {
        title: projectData.title,
        description: projectData.description,
        states:
          projectData.status === "Not Started"
            ? "NS"
            : projectData.status === "In Progress"
            ? "prog"
            : "comp",
        start_date: projectData.startDate,
        complete_date: completedDate || null,
      };

      const { data, error } = await supabase
        .from("projects")
        .insert([supabaseInsertData])
        .select()
        .single();

      if (error) {
        console.error("Supabase insert error:", error);
        setError(new Error(error.message));
        return;
      }

      if (!data || !data.id) {
        throw new Error("Supabase insert returned no id.");
      }

      const newProject: Project = {
        ...projectData,
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        supa_id: data.id,
        completedDate,
      };

      await dbOperation(PROJECTS_STORE, "readwrite", (store) =>
        store.add(newProject)
      );

      setProjects((prev) => [...prev, newProject]);
    } catch (err) {
      console.error("Error adding project:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  };

  const updateProject = async (id: string, projectData: Partial<Project>) => {
    try {
      const project = projects.find((p) => p.id === id);
      if (!project) throw new Error(`Project with id ${id} not found`);

      let completedDate = projectData.completedDate;
      // If status is being set to Completed and completedDate is not provided, set it to today
      const newStatus = projectData.status || project.status;
      if (newStatus === "Completed" && !completedDate) {
        completedDate = new Date().toISOString().split('T')[0];
      }

      const updatedProject = { ...project, ...projectData, completedDate };

      if (!updatedProject.supa_id) {
        throw new Error("Missing supa_id for Supabase update.");
      }

      const supabaseUpdateData: any = {
        title: updatedProject.title,
        description: updatedProject.description,
        states:
          updatedProject.status === "Not Started"
            ? "NS"
            : updatedProject.status === "In Progress"
            ? "prog"
            : "comp",
        start_date: updatedProject.startDate,
        complete_date: updatedProject.completedDate || null,
      };

      const { error: supabaseError } = await supabase
        .from("projects")
        .update(supabaseUpdateData)
        .eq("id", updatedProject.supa_id);

      if (supabaseError) {
        console.error("Supabase update error:", supabaseError);
        setError(new Error(supabaseError.message));
        return;
      }

      await dbOperation(PROJECTS_STORE, "readwrite", (store) =>
        store.put(updatedProject)
      );

      setProjects((prev) =>
        prev.map((p) => (p.id === id ? updatedProject : p))
      );
    } catch (err) {
      console.error("Error updating project:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const supa_id = await getSupaIdFromIndexedDB(id);

      if (supa_id) {
        const { error: supabaseError } = await supabase
          .from("projects")
          .delete()
          .eq("id", supa_id);

        if (supabaseError) {
          console.error("Error deleting project from Supabase:", supabaseError);
        }
      }

      await dbOperation(PROJECTS_STORE, "readwrite", (store) => store.delete(id));

      const projectMilestones = milestones.filter((m) => m.projectId === id);
      for (const milestone of projectMilestones) {
        await dbOperation(MILESTONES_STORE, "readwrite", (store) =>
          store.delete(milestone.id)
        );
      }

      setProjects((prev) => prev.filter((p) => p.id !== id));
      setMilestones((prev) => prev.filter((m) => m.projectId !== id));
    } catch (err) {
      console.error("Error deleting project:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  };

  const addMilestone = async (
    projectId: string,
    milestoneData: Omit<Milestone, "id" | "projectId" | "mile_id">
  ): Promise<Milestone | null> => {
    try {
      const supa_id = await getSupaIdFromIndexedDB(projectId);
      if (!supa_id) {
        throw new Error("Supabase project ID (supa_id) not found in IndexedDB.");
      }

      const supabaseInsertData = {
        id_fk: supa_id,
        mile_name: milestoneData.name,
        due_date: milestoneData.dueDate,
      };

      const { data, error } = await supabase
        .from("milestone")
        .insert([supabaseInsertData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // del_mile_if is the inserted milestone data with milestone_id
      const del_mile_if = data;

      const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newMilestone: Milestone = {
        ...milestoneData,
        id: uniqueId,
        projectId,
        mile_id: del_mile_if.milestone_id, // store Supabase milestone_id here
      };

      await dbOperation(MILESTONES_STORE, "readwrite", (store) =>
        store.add(newMilestone)
      );

      setMilestones((prev) => [...prev, newMilestone]);

      return newMilestone;
    } catch (err) {
      console.error("Error adding milestone:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  };

  const updateMilestone = async (
    id: string,
    milestoneData: Partial<Milestone>
  ) => {
    try {
      const milestone = milestones.find((m) => m.id === id);
      if (!milestone) return;

      const updatedMilestone = { ...milestone, ...milestoneData };

      await dbOperation(MILESTONES_STORE, "readwrite", (store) =>
        store.put(updatedMilestone)
      );

      setMilestones((prev) =>
        prev.map((m) => (m.id === id ? updatedMilestone : m))
      );
    } catch (err) {
      console.error("Error updating milestone:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  };

  // deleteMilestone deletes from Supabase using mile_id, then from IndexedDB
  const deleteMilestone = async (id: string) => {
    try {
      // Find the milestone by local id to get mile_id (Supabase milestone_id)
      const milestone = milestones.find((m) => m.id === id);

      if (milestone && milestone.mile_id) {
        const { error: supabaseError } = await supabase
          .from("milestone")
          .delete()
          .eq("milestone_id", milestone.mile_id);

        if (supabaseError) {
          console.error("Error deleting milestone from Supabase:", supabaseError);
          // Optionally handle the error (e.g. throw or notify user)
        }
      } else {
        console.warn(
          `Milestone with id ${id} missing mile_id (Supabase milestone_id). Skipping Supabase delete.`
        );
      }

      // Delete from IndexedDB
      await dbOperation(MILESTONES_STORE, "readwrite", (store) => store.delete(id));

      // Update React state
      setMilestones((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error("Error deleting milestone:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  };

  const getProjectMilestones = (projectId: string) => {
    return milestones.filter((m) => m.projectId === projectId);
  };

  const setCurrentWork = async (projectId: string, isCurrent: boolean) => {
    try {
      // If setting this project as current work, first unset all other projects
      if (isCurrent) {
        const currentProjects = projects.filter(p => p.isCurrentWork);
        for (const project of currentProjects) {
          const updatedProject = { ...project, isCurrentWork: false };
          await dbOperation(PROJECTS_STORE, "readwrite", (store) =>
            store.put(updatedProject)
          );
        }
        
        // Update state for all projects that were unset
        setProjects((prev) =>
          prev.map((p) => ({ ...p, isCurrentWork: false }))
        );
      }

      // Now set the target project
      const project = projects.find((p) => p.id === projectId);
      if (!project) throw new Error(`Project with id ${projectId} not found`);

      const updatedProject = { ...project, isCurrentWork: isCurrent };

      await dbOperation(PROJECTS_STORE, "readwrite", (store) =>
        store.put(updatedProject)
      );

      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? updatedProject : p))
      );
    } catch (err) {
      console.error("Error setting current work:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  };

  return {
    projects,
    milestones,
    isLoading,
    error,
    addProject,
    updateProject,
    deleteProject,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    getProjectMilestones,
    setCurrentWork,
  };
};
