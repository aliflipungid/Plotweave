window.addEventListener('load-view', (e) => {
    if (e.detail.view === 'dashboard') {
        renderDashboard(e.detail.container);
    }
});

function renderDashboard(container) {
    const project = storage.currentProject;
    
    if (!project) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-book-open" style="font-size: 4rem; color: var(--accent-primary); margin-bottom: 20px;"></i>
                <h2>Belum Ada Proyek</h2>
                <p>Mulai dengan membuat proyek baru untuk merencanakan novelmu.</p>
                <button onclick="window.app.openModal('modal-new-project')" class="btn-primary" style="margin-top: 20px;">
                    <i class="fas fa-plus"></i> Buat Proyek Baru
                </button>
            </div>
        `;
        return;
    }

    const totalChapters = project.chapters.length;
    const totalScenes = project.chapters.reduce((acc, ch) => acc + (ch.scenes?.length || 0), 0);
    const totalCharacters = project.characters.length;
    const progressPercent = Math.min(100, Math.round((project.currentWordCount / project.targetWordCount) * 100));
    
    const structureFields = [
        project.storyBible?.structure?.act1?.hook,
        project.storyBible?.structure?.act1?.incitingIncident,
        project.storyBible?.structure?.act1?.firstPlotPoint,
        project.storyBible?.structure?.act2?.midpoint,
        project.storyBible?.structure?.act3?.climax
    ];
    const structureComplete = structureFields.filter(f => f && f.trim() !== '').length;
    const structurePercent = Math.round((structureComplete / structureFields.length) * 100);

    container.innerHTML = `
        <div class="dashboard-content">
            <div class="card project-welcome">
                <div class="project-header">
                    <div>
                        <h2>${project.title}</h2>
                        <span class="genre-badge">${project.genre}</span>
                        <p class="project-desc">${project.description || 'Tidak ada deskripsi'}</p>
                    </div>
                    <div class="project-status">
                        <span class="status-badge ${project.status}">${getStatusLabel(project.status)}</span>
                    </div>
                </div>
            </div>

            <div class="dashboard-grid">
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-pen-fancy"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${project.currentWordCount.toLocaleString()}</h3>
                        <p>Kata Tertulis</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon" style="background-color: rgba(59, 130, 246, 0.1); color: var(--info);">
                        <i class="fas fa-bullseye"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${project.targetWordCount.toLocaleString()}</h3>
                        <p>Target Kata</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon" style="background-color: rgba(16, 185, 129, 0.1); color: var(--success);">
                        <i class="fas fa-percentage"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${progressPercent}%</h3>
                        <p>Progress</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon" style="background-color: rgba(245, 158, 11, 0.1); color: var(--warning);">
                        <i class="fas fa-list-ol"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${totalChapters}</h3>
                        <p>Bab</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon" style="background-color: rgba(239, 68, 68, 0.1); color: var(--danger);">
                        <i class="fas fa-film"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${totalScenes}</h3>
                        <p>Scene</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon" style="background-color: rgba(139, 92, 246, 0.1); color: var(--accent-primary);">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${totalCharacters}</h3>
                        <p>Karakter</p>
                    </div>
                </div>
            </div>

            <div class="card progress-section">
                <div class="card-header">
                    <span class="card-title">Progress Menulis</span>
                    <span class="progress-text">${progressPercent}% selesai</span>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${progressPercent}%"></div>
                </div>
                <p style="margin-top: 10px; color: var(--text-secondary); font-size: 0.9rem;">
                    ${project.targetWordCount - project.currentWordCount > 0 
                        ? `${(project.targetWordCount - project.currentWordCount).toLocaleString()} kata lagi menuju target` 
                        : 'Target tercapai! 🎉'}
                </p>
            </div>

            <div class="card">
                <div class="card-header">
                    <span class="card-title">Struktur Cerita (Three-Act)</span>
                    <span class="progress-text">${structurePercent}% lengkap</span>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${structurePercent}%; background: linear-gradient(90deg, var(--info), var(--accent-primary));"></div>
                </div>
                <div class="structure-checklist" style="margin-top: 20px; display: grid; gap: 10px;">
                    ${renderStructureChecklist(project.storyBible?.structure)}
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <span class="card-title">Aksi Cepat</span>
                </div>
                <div class="quick-actions">
                    <button onclick="window.app.navigateTo('story-bible')" class="action-card">
                        <i class="fas fa-book"></i>
                        <span>Edit Story Bible</span>
                    </button>
                    <button onclick="window.app.navigateTo('characters')" class="action-card">
                        <i class="fas fa-user-plus"></i>
                        <span>Tambah Karakter</span>
                    </button>
                    <button onclick="window.app.navigateTo('chapters')" class="action-card">
                        <i class="fas fa-plus-circle"></i>
                        <span>Tambah Bab</span>
                    </button>
                    <button onclick="window.app.navigateTo('structure')" class="action-card">
                        <i class="fas fa-sitemap"></i>
                        <span>Lihat Struktur</span>
                    </button>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <span class="card-title">Aktivitas Terakhir</span>
                </div>
                <div class="activity-list">
                    <div class="activity-item">
                        <i class="fas fa-clock"></i>
                        <div>
                            <p>Proyek dibuat</p>
                            <small>${formatDate(project.created)}</small>
                        </div>
                    </div>
                    <div class="activity-item">
                        <i class="fas fa-edit"></i>
                        <div>
                            <p>Terakhir diupdate</p>
                            <small>${formatDate(project.modified)}</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getStatusLabel(status) {
    const labels = {
        'planning': 'Perencanaan',
        'drafting': 'Menulis Draft',
        'editing': 'Editing',
        'completed': 'Selesai'
    };
    return labels[status] || status;
}

function renderStructureChecklist(structure) {
    if (!structure) return '<p style="color: var(--text-muted);">Belum ada data struktur</p>';
    
    const items = [
        { key: 'hook', label: 'Hook (Act 1)', value: structure.act1?.hook },
        { key: 'incitingIncident', label: 'Inciting Incident', value: structure.act1?.incitingIncident },
        { key: 'firstPlotPoint', label: 'First Plot Point', value: structure.act1?.firstPlotPoint },
        { key: 'midpoint', label: 'Midpoint (Act 2)', value: structure.act2?.midpoint },
        { key: 'climax', label: 'Climax (Act 3)', value: structure.act3?.climax }
    ];

    return items.map(item => `
        <div class="checklist-item">
            <i class="fas ${item.value && item.value.trim() !== '' ? 'fa-check-circle' : 'fa-circle'}" 
               style="color: ${item.value && item.value.trim() !== '' ? 'var(--success)' : 'var(--text-muted)'};"></i>
            <span style="${item.value && item.value.trim() !== '' ? '' : 'color: var(--text-muted);'}">${item.label}</span>
        </div>
    `).join('');
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
