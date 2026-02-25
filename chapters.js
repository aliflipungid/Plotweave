window.addEventListener('load-view', (e) => {
    if (e.detail.view === 'chapters') {
        renderChapters(e.detail.container);
    }
});

let expandedChapters = new Set();

function renderChapters(container) {
    const project = storage.currentProject;
    
    if (!project) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-list-ol" style="font-size: 4rem; color: var(--accent-primary); margin-bottom: 20px;"></i>
                <h2>Belum Ada Proyek</h2>
                <p>Buat proyek terlebih dahulu untuk mengelola bab.</p>
            </div>
        `;
        return;
    }

    const chapters = project.chapters || [];
    
    container.innerHTML = `
        <div class="chapters-content">
            <div class="card-header" style="margin-bottom: 20px;">
                <span class="card-title">Daftar Bab (${chapters.length})</span>
                <button onclick="addNewChapter()" class="btn-primary">
                    <i class="fas fa-plus"></i> Tambah Bab
                </button>
            </div>

            <div class="chapter-list">
                ${chapters.length === 0 ? 
                    '<div style="text-align: center; color: var(--text-muted); padding: 40px;">Belum ada bab. Klik "Tambah Bab" untuk membuat.</div>' 
                    : chapters.map((ch, idx) => renderChapterItem(ch, idx)).join('')
                }
            </div>

            ${chapters.length > 0 ? `
                <button onclick="addNewChapter()" class="add-btn" style="margin-top: 20px;">
                    <i class="fas fa-plus"></i> Tambah Bab Baru
                </button>
            ` : ''}
        </div>
    `;
}

function renderChapterItem(chapter, index) {
    const isExpanded = expandedChapters.has(chapter.id);
    const scenes = chapter.scenes || [];
    
    return `
        <div class="chapter-item ${isExpanded ? 'expanded' : ''}" data-chapter-id="${chapter.id}">
            <div class="chapter-header" onclick="toggleChapter('${chapter.id}')">
                <div style="display: flex; align-items: center; gap: 15px; flex: 1;">
                    <span class="chapter-number">Bab ${index + 1}</span>
                    <input type="text" 
                           class="chapter-title-input" 
                           value="${chapter.title || ''}" 
                           placeholder="Judul Bab..."
                           onclick="event.stopPropagation()"
                           onchange="updateChapterTitle('${chapter.id}', this.value)"
                           onblur="updateChapterTitle('${chapter.id}', this.value)">
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="color: var(--text-muted); font-size: 0.85rem;">
                        ${scenes.length} scene
                    </span>
                    <i class="fas fa-chevron-${isExpanded ? 'up' : 'down'}" style="color: var(--text-muted);"></i>
                    <button onclick="event.stopPropagation(); deleteChapter('${chapter.id}')" class="btn-icon" style="color: var(--danger);">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            
            <div class="chapter-scenes">
                ${scenes.map((scene, sIdx) => renderSceneItem(scene, sIdx, chapter.id)).join('')}
                
                <button onclick="addNewScene('${chapter.id}')" class="add-btn">
                    <i class="fas fa-plus"></i> Tambah Scene
                </button>
            </div>
        </div>
    `;
}

function renderSceneItem(scene, index, chapterId) {
    return `
        <div class="scene-item" data-scene-id="${scene.id}">
            <div class="scene-header">
                <div>
                    <span style="font-weight: 600;">Scene ${index + 1}</span>
                    <span class="scene-pov">
                        <i class="fas fa-eye"></i> ${scene.pov || 'Belum ditentukan'}
                    </span>
                </div>
                <button onclick="deleteScene('${chapterId}', '${scene.id}')" class="btn-icon" style="color: var(--danger);">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="form-group" style="margin-bottom: 10px;">
                <input type="text" 
                       value="${scene.goal || ''}" 
                       placeholder="Goal scene ini..."
                       onchange="updateScene('${chapterId}', '${scene.id}', 'goal', this.value)"
                       style="background: var(--bg-secondary);">
            </div>
            <div class="form-row" style="grid-template-columns: 1fr 1fr; gap: 10px;">
                <select onchange="updateScene('${chapterId}', '${scene.id}', 'pov', this.value)" 
                        style="background: var(--bg-secondary);">
                    <option value="">Pilih POV...</option>
                    ${getCharacterOptions(scene.pov)}
                </select>
                <select onchange="updateScene('${chapterId}', '${scene.id}', 'type', this.value)"
                        style="background: var(--bg-secondary);">
                    <option value="action" ${scene.type === 'action' ? 'selected' : ''}>Action</option>
                    <option value="reaction" ${scene.type === 'reaction' ? 'selected' : ''}>Reaction</option>
                    <option value="sequel" ${scene.type === 'sequel' ? 'selected' : ''}>Sequel</option>
                    <option value="setup" ${scene.type === 'setup' ? 'selected' : ''}>Setup</option>
                </select>
            </div>
            <div class="form-group" style="margin-top: 10px; margin-bottom: 0;">
                <textarea rows="2" 
                          placeholder="Conflict dan outcome..."
                          onchange="updateScene('${chapterId}', '${scene.id}', 'conflict', this.value)"
                          style="background: var(--bg-secondary);">${scene.conflict || ''}</textarea>
            </div>
        </div>
    `;
}

function getCharacterOptions(selectedPov) {
    const project = storage.currentProject;
    if (!project || !project.characters) return '';
    
    return project.characters.map(char => 
        `<option value="${char.name}" ${char.name === selectedPov ? 'selected' : ''}>${char.name || 'Unnamed'}</option>`
    ).join('');
}

function toggleChapter(chapterId) {
    if (expandedChapters.has(chapterId)) {
        expandedChapters.delete(chapterId);
    } else {
        expandedChapters.add(chapterId);
    }
    renderChapters(document.getElementById('content-area'));
}

function addNewChapter() {
    const project = storage.currentProject;
    if (!project) return;

    const newChapter = {
        id: storage.generateId(),
        title: '',
        scenes: []
    };

    project.chapters = project.chapters || [];
    project.chapters.push(newChapter);
    expandedChapters.add(newChapter.id);
    
    PlotWeaveApp.saveCurrentProject().then(() => {
        renderChapters(document.getElementById('content-area'));
    });
}

function updateChapterTitle(chapterId, title) {
    const project = storage.currentProject;
    const chapter = project.chapters.find(c => c.id === chapterId);
    if (chapter) {
        chapter.title = title;
        PlotWeaveApp.saveCurrentProject();
    }
}

function deleteChapter(chapterId) {
    if (!confirm('Hapus bab ini dan semua scene di dalamnya?')) return;
    
    const project = storage.currentProject;
    project.chapters = project.chapters.filter(c => c.id !== chapterId);
    expandedChapters.delete(chapterId);
    
    PlotWeaveApp.saveCurrentProject().then(() => {
        renderChapters(document.getElementById('content-area'));
    });
}

function addNewScene(chapterId) {
    const project = storage.currentProject;
    const chapter = project.chapters.find(c => c.id === chapterId);
    if (!chapter) return;

    const newScene = {
        id: storage.generateId(),
        goal: '',
        conflict: '',
        pov: '',
        type: 'action',
        outcome: ''
    };

    chapter.scenes = chapter.scenes || [];
    chapter.scenes.push(newScene);
    
    PlotWeaveApp.saveCurrentProject().then(() => {
        renderChapters(document.getElementById('content-area'));
    });
}

function updateScene(chapterId, sceneId, field, value) {
    const project = storage.currentProject;
    const chapter = project.chapters.find(c => c.id === chapterId);
    if (!chapter) return;
    
    const scene = chapter.scenes.find(s => s.id === sceneId);
    if (scene) {
        scene[field] = value;
        PlotWeaveApp.saveCurrentProject();
    }
}

function deleteScene(chapterId, sceneId) {
    if (!confirm('Hapus scene ini?')) return;
    
    const project = storage.currentProject;
    const chapter = project.chapters.find(c => c.id === chapterId);
    if (!chapter) return;
    
    chapter.scenes = chapter.scenes.filter(s => s.id !== sceneId);
    
    PlotWeaveApp.saveCurrentProject().then(() => {
        renderChapters(document.getElementById('content-area'));
    });
}
