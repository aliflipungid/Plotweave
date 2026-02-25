/**
 * PlotWeave Storage Manager
 */

const DB_NAME = 'PlotWeaveDB';
const DB_VERSION = 1;
const STORE_PROJECTS = 'projects';

class StorageManager {
    constructor() {
        this.db = null;
        this.currentProject = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
                    const store = db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
                    store.createIndex('title', 'title', { unique: false });
                    store.createIndex('modified', 'modified', { unique: false });
                }
            };
        });
    }

    generateId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    createDefaultProject(title, genre, targetWords, description) {
        const now = new Date().toISOString();
        return {
            id: this.generateId(),
            title: title,
            genre: genre,
            targetWordCount: parseInt(targetWords) || 80000,
            currentWordCount: 0,
            description: description || '',
            status: 'planning',
            created: now,
            modified: now,
            
            storyBible: {
                premise: {
                    logline: '',
                    premise: '',
                    theme: '',
                    centralConflict: { internal: '', external: '' },
                    tone: ''
                },
                structure: {
                    act1: { hook: '', incitingIncident: '', firstPlotPoint: '' },
                    act2: { 
                        firstPinchPoint: '', 
                        midpoint: '', 
                        secondPinchPoint: '', 
                        secondPlotPoint: '' 
                    },
                    act3: { climax: '', resolution: '' }
                }
            },

            characters: [],
            chapters: [],
            
            worldBuilding: {
                magicSystem: { rules: [], limitations: [], costs: [] },
                locations: [],
                history: [],
                cultures: []
            },

            subplots: []
        };
    }

    async saveProject(project) {
        project.modified = new Date().toISOString();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_PROJECTS], 'readwrite');
            const store = transaction.objectStore(STORE_PROJECTS);
            const request = store.put(project);

            request.onsuccess = () => resolve(project);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllProjects() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_PROJECTS], 'readonly');
            const store = transaction.objectStore(STORE_PROJECTS);
            const request = store.getAll();

            request.onsuccess = () => {
                const projects = request.result.sort((a, b) => 
                    new Date(b.modified) - new Date(a.modified)
                );
                resolve(projects);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async getProject(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_PROJECTS], 'readonly');
            const store = transaction.objectStore(STORE_PROJECTS);
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteProject(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_PROJECTS], 'readwrite');
            const store = transaction.objectStore(STORE_PROJECTS);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async exportData() {
        const projects = await this.getAllProjects();
        const data = {
            app: 'PlotWeave',
            version: '1.0',
            exportDate: new Date().toISOString(),
            projects: projects
        };
        return JSON.stringify(data, null, 2);
    }

    async importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (!data.projects || !Array.isArray(data.projects)) {
                throw new Error('Invalid data format');
            }

            for (const project of data.projects) {
                project.id = this.generateId();
                project.modified = new Date().toISOString();
                await this.saveProject(project);
            }
            return true;
        } catch (error) {
            console.error('Import error:', error);
            return false;
        }
    }
}

const storage = new StorageManager();
