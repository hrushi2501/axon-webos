import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = () => (
    <div className="flex items-center justify-center w-full h-full text-[rgb(var(--accent-color))]">
        <Loader2 className="w-8 h-8 animate-spin" />
    </div>
);

export const About = dynamic(() => import('./About').then(mod => mod.About), { loading: LoadingSpinner });
export const Resume = dynamic(() => import('./Resume').then(mod => mod.Resume), { loading: LoadingSpinner });
export const Projects = dynamic(() => import('./Projects').then(mod => mod.Projects), { loading: LoadingSpinner });
export const Contact = dynamic(() => import('./Contact').then(mod => mod.Contact), { loading: LoadingSpinner });
export const FileManager = dynamic(() => import('./FileManager').then(mod => mod.FileManager), { loading: LoadingSpinner });
export const TextEditor = dynamic(() => import('./TextEditor').then(mod => mod.TextEditor), { loading: LoadingSpinner });
export const TaskManager = dynamic(() => import('./TaskManager').then(mod => mod.TaskManager), { loading: LoadingSpinner });
export const Settings = dynamic(() => import('./Settings').then(mod => mod.Settings), { loading: LoadingSpinner });
export const Terminal = dynamic(() => import('./Terminal').then(mod => mod.Terminal), { loading: LoadingSpinner });
export const Copilot = dynamic(() => import('./Copilot').then(mod => mod.Copilot), { loading: LoadingSpinner });
