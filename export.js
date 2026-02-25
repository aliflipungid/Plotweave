window.addEventListener('load-view', (e) => {
    if (e.detail.view === 'export') {
        renderExport(e.detail.container);
    }
});

function renderExport(container) {
    const project = storage.currentProject;
    
    container.innerHTML = `
        <div class="export-content">
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Export & Backup</span>
                </div>
                <p style="color: var(--text-secondary); margin-bottom: 20px;">
                    Simpan proyekmu dalam berbagai format atau backup seluruh data aplikasi.
                </p>
            </div>

            <div class="export-options">
                <div class="export-card" onclick="exportJSON()">
                    <i class="fas fa-file-code"></i>
                    <h3>JSON Backup</h3>
                    <p>Backup lengkap semua proyek untuk restore nanti</p>
                </div>

                <div class="export-card" onclick="exportProjectJSON()">
                    <i class="fas fa-file-export"></i>
                    <h3>Project JSON</h3>
                    <p>Export proyek aktif saja (untuk sharing)</p>
                </div>

                <div class="export-card" onclick="exportOutline()">
                    <i class="fas fa-list-alt"></i>
                    <h3>Outline Text</h3>
                    <p>Export outline cerita dalam format teks</p>
                </div>

                <div class="export-card" onclick="exportCharacters()">
                    <i class="fas fa-users"></i>
                    <h3>Character Sheets</h3>
                    <p>Export detail semua karakter</p>
                </div>
            </div>

            ${project ? `
                <div class="card" style="margin-top: 30px;">
                    <div class="card-header">
                        <span class="card-title">Statistik Proyek Aktif</span>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                        <div style="background: var(--bg-tertiary); padding: 15px; border-radius: var(--radius);">
                            <div style="color: var(--text-muted); font-size: 0.85rem;">Judul</div>
                            <div style="font-weight: 600;">${project.title}</div>
                        </div>
                        <div style="background: var(--bg-tertiary); padding: 15px; border-radius: var(--radius);">
                            <div style="color: var(--text-muted); font-size: 0.85rem;">Genre</div>
                            <div style="font-weight: 600;">${project.genre}</div>
                        </div>
                        <div style="background: var(--bg-tertiary); padding: 15px; border-radius: var(--radius);">
                            <div style="color: var(--text-muted); font-size: 0.85rem;">Karakter</div>
                            <div style="font-weight: 600;">${project.characters?.length || 0}</div>
                        </div>
                        <div style="background: var(--bg-tertiary); padding: 15px; border-radius: var(--radius);">
                            <div style="color: var(--text-muted); font-size: 0.85rem;">Bab</div>
                            <div style="font-weight: 600;">${project.chapters?.length || 0}</div>
                        </div>
                    </div>
                </div>
            ` : ''}

            <div class="card" style="margin-top: 30px; background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.3);">
                <div class="card-header">
                    <span class="card-title" style="color: var(--danger);"><i class="fas fa-exclamation-triangle"></i> Zona Berbahaya</span>
                </div>
                <p style="color: var(--text-secondary); margin-bottom: 15px;">
                    Hapus semua data permanen. Aksi ini tidak bisa dibatalkan!
                </p>
                <button onclick="clearAllData()" class="btn-danger">
                    <i class="fas fa-trash-alt"></i> Hapus Semua Data
                </button>
            </div>
        </div>
    `;
}

async function exportJSON() {
    const data = await storage.exportData();
    downloadFile(data, `plotweave-backup-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
}

async function exportProjectJSON() {
    const project = storage.currentProject;
    if (!project) {
        alert('Tidak ada proyek aktif!');
        return;
    }
    
    const data = JSON.stringify(project, null, 2);
    downloadFile(data, `${project.title.replace(/\s+/g, '_')}.json`, 'application/json');
}

function exportOutline() {
    const project = storage.currentProject;
    if (!project) {
        alert('Tidak ada proyek aktif!');
        return;
    }

    let outline = `OUTLINE: ${project.title}\n`;
    outline += `Genre: ${project.genre}\n`;
    outline += `Target: ${project.targetWordCount} kata\n\n`;
    
    outline += `=== PREMISE ===\n`;
    outline += `${project.storyBible?.premise?.logline || 'Belum ada logline'}\n\n`;
    
    outline += `=== STRUKTUR ===\n`;
    const s = project.storyBible?.structure || {};
    outline += `Hook: ${s.act1?.hook || '-'}\n`;
    outline += `Inciting Incident: ${s.act1?.incitingIncident || '-'}\n`;
    outline += `First Plot Point: ${s.act1?.firstPlotPoint || '-'}\n`;
    outline += `Midpoint: ${s.act2?.midpoint || '-'}\n`;
    outline += `Climax: ${s.act3?.climax || '-'}\n`;
    outline += `Resolution: ${s.act3?.resolution || '-'}\n\n`;
    
    outline += `=== KARAKTER ===\n`;
    (project.characters || []).forEach(char => {
        outline += `- ${char.name} (${char.role}): ${char.arc?.goal || 'No goal'}\n`;
    });
    outline += `\n`;
    
    outline += `=== BAB ===\n`;
    (project.chapters || []).forEach((ch, idx) => {
        outline += `Bab ${idx + 1}: ${ch.title || 'Untitled'}\n`;
        (ch.scenes || []).forEach((scene, sIdx) => {
            outline += `  Scene ${sIdx + 1}: ${scene.goal || 'No goal'} (${scene.pov || 'No POV'})\n`;
        });
    });

    downloadFile(outline, `${project.title.replace(/\s+/g, '_')}_outline.txt`, 'text/plain');
}

function exportCharacters() {
    const project = storage.currentProject;
    if (!project || !project.characters?.length) {
        alert('Tidak ada karakter!');
        return;
    }

    let text = `CHARACTER SHEETS: ${project.title}\n\n`;
    
    project.characters.forEach(char => {
        text += `========================================\n`;
        text += `NAMA: ${char.name || 'Unnamed'}\n`;
        text += `ROLE: ${char.role || 'Unknown'}\n`;
        text += `USIA: ${char.age || '-'}\n`;
        text += `PEKERJAAN: ${char.occupation || '-'}\n\n`;
        
        text += `GOAL: ${char.arc?.goal || '-'}\n`;
        text += `MOTIVATION: ${char.arc?.motivation || '-'}\n`;
        text += `STAKES: ${char.arc?.stakes || '-'}\n\n`;
        
        text += `CORE WOUND: ${char.psychology?.coreWound || '-'}\n`;
        text += `LIE: ${char.psychology?.lie || '-'}\n`;
        text += `TRUTH: ${char.psychology?.truth || '-'}\n\n`;
        
        text += `STRENGTHS: ${char.traits?.strengths || '-'}\n`;
        text += `WEAKNESSES: ${char.traits?.weaknesses || '-'}\n\n`;
        
        text += `ARC TYPE: ${char.arc?.type || '-'}\n`;
        text += `START: ${char.arc?.startingState || '-'}\n`;
        text += `END: ${char.arc?.endingState || '-'}\n\n`;
    });

    downloadFile(text, `${project.title.replace(/\s+/g, '_')}_characters.txt`, 'text/plain');
}

function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

async function clearAllData() {
    if (!confirm('PERINGATAN: Ini akan menghapus SEMUA proyek permanen! Lanjutkan?')) return;
    if (!confirm('Yakin? Data tidak bisa dikembalikan!')) return;
    
    const projects = await storage.getAllProjects();
    for (const p of projects) {
        await storage.deleteProject(p.id);
    }
    
    storage.currentProject = null;
    await window.app.loadProjects();
    window.app.navigateTo('dashboard');
    alert('Semua data telah dihapus.');
}
