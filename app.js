/**
 * PlotWeave Main Application
 */

class PlotWeaveApp {
    constructor() {
        this.currentView = 'dashboard';
        this.sidebarCollapsed = false;
    }

    async init() {
        await storage.init();
        this.setupEventListeners();
        await this.loadProjects();
        this.navigateTo('dashboard');
    }

    setupEventListeners() {
        document.getElementById('toggle-sidebar').addEventListener('click', () => {
            this.toggleSidebar();
        });

        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.navigateTo(view);
            });
        });

        document.getElementById('new-project-btn').addEventListener('click', () => {
            this.openModal('modal-new-project');
        });

        document.querySelector('.modal-close').addEventListener('click', () => {
            this.closeModal('modal-new-project');
        });

        document.getElementById('new-project-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createNewProject();
        });

        document.getElementById('project-select').addEventListener('change', (e) => {
            this.selectProject(e.target.value);
        });

        document.getElementById('backup-btn').addEventListener('click', () => {
            this.backupData();
        });

        document.getElementById('restore-btn').addEventListener('click', () => {
            document.getElementById('restore-input').click();
        });

        document.getElementById('restore-input').addEventListener('change', (e) => {
            this.restoreData(e.target.files[0]);
        });

        window.addEventListener('save-status', (e) => {
            this.updateSaveIndicator(e.detail.status);
        });
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        this.sidebarCollapsed = !this.sidebarCollapsed;
        sidebar.classList.toggle('collapsed', this.sidebarCollapsed);
    }

    navigateTo(view) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.view === view);
        });

        const titles = {
            'dashboard': 'Dashboard',
            'story-bible': 'Story Bible',
            'characters': 'Karakter',
            'structure': 'Struktur Cerita',
            'chapters': 'Bab & Scene',
            'worldbuilding': 'World Building',
            'export': 'Export & Backup'
        };
        document.getElementById('page-title').textContent = titles[view] || view;

        this.currentView = view;
        this.loadViewContent(view);
    }

    async loadViewContent(view) {
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = '<div class="loading">Memuat...</div>';

        const event = new CustomEvent('load-view', { 
            detail: { view: view, container: contentArea } 
        });
        window.dispatchEvent(event);
    }

    async loadProjects() {
        const projects = await storage.getAllProjects();
        const select = document.getElementById('project-select');
        
        while (select.options.length > 1) {
            select.remove(1);
        }

        projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.title;
            select.appendChild(option);
        });

        if (storage.currentProject) {
            select.value = storage.currentProject.id;
        }
    }

    async createNewProject() {
        const title = document.getElementById('project-title').value;
        const genre = document.getElementById('project-genre').value;
        const target = document.getElementById('project-target').value;
        const desc = document.getElementById('project-desc').value;

        const project = storage.createDefaultProject(title, genre, target, desc);
        await storage.saveProject(project);
        
        storage.currentProject = project;
        await this.loadProjects();
        
        document.getElementById('project-select').value = project.id;
        
        this.closeModal('modal-new-project');
        this.navigateTo('dashboard');
        
        document.getElementById('new-project-form').reset();
    }

    async selectProject(projectId) {
        if (!projectId) {
            storage.currentProject = null;
            return;
        }

        storage.currentProject = await storage.getProject(projectId);
        this.loadViewContent(this.currentView);
    }

    openModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }

    updateSaveIndicator(status) {
        const indicator = document.getElementById('save-indicator');
        indicator.className = `save-status ${status}`;
        
        if (status === 'saved') {
            indicator.innerHTML = '<i class="fas fa-check"></i> Tersimpan';
        } else if (status === 'saving') {
            indicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
        }
    }

    async backupData() {
        const data = await storage.exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `plotweave-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }

    async restoreData(file) {
        if (!file) return;
        
        const text = await file.text();
        const success = await storage.importData(text);
        
        if (success) {
            alert('Data berhasil di-restore!');
            await this.loadProjects();
            this.navigateTo('dashboard');
        } else {
            alert('Gagal restore data. Format file tidak valid.');
        }
    }

    static async saveCurrentProject() {
        if (!storage.currentProject) return;
        
        window.dispatchEvent(new CustomEvent('save-status', { detail: { status: 'saving' } }));
        
        await storage.saveProject(storage.currentProject);
        
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent('save-status', { detail: { status: 'saved' } }));
        }, 500);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new PlotWeaveApp();
    window.app.init();
});
