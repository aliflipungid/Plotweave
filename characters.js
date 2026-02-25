window.addEventListener('load-view', (e) => {
    if (e.detail.view === 'characters') {
        renderCharacters(e.detail.container);
    }
});

let currentEditingCharacter = null;

function renderCharacters(container) {
    const project = storage.currentProject;
    
    if (!project) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users" style="font-size: 4rem; color: var(--accent-primary); margin-bottom: 20px;"></i>
                <h2>Belum Ada Proyek</h2>
                <p>Buat proyek terlebih dahulu untuk mengelola karakter.</p>
            </div>
        `;
        return;
    }

    if (currentEditingCharacter) {
        renderCharacterDetail(container, currentEditingCharacter);
        return;
    }

    const characters = project.characters || [];
    
    container.innerHTML = `
        <div class="characters-content">
            <div class="card-header" style="margin-bottom: 20px;">
                <span class="card-title">Daftar Karakter (${characters.length})</span>
                <button onclick="addNewCharacter()" class="btn-primary">
                    <i class="fas fa-plus"></i> Tambah Karakter
                </button>
            </div>

            <div class="character-grid">
                ${characters.length === 0 ? 
                    '<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">Belum ada karakter. Klik "Tambah Karakter" untuk membuat.</div>' 
                    : characters.map(char => renderCharacterCard(char)).join('')
                }
            </div>
        </div>
    `;
}

function renderCharacterCard(char) {
    const roleLabels = {
        'protagonist': 'Protagonist',
        'antagonist': 'Antagonist',
        'deuteragonist': 'Deuteragonist',
        'sidekick': 'Sidekick',
        'mentor': 'Mentor',
        'love-interest': 'Love Interest',
        'supporting': 'Supporting'
    };

    return `
        <div class="character-card" onclick="editCharacter('${char.id}')">
            <button class="character-delete" onclick="event.stopPropagation(); deleteCharacter('${char.id}')">
                <i class="fas fa-trash"></i>
            </button>
            <div class="character-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="character-name">${char.name || 'Unnamed'}</div>
            <span class="character-role">${roleLabels[char.role] || char.role}</span>
            <div class="character-arc">${char.arc?.goal || 'Tidak ada goal'}</div>
        </div>
    `;
}

function renderCharacterDetail(container, charId) {
    const project = storage.currentProject;
    const char = project.characters.find(c => c.id === charId) || createNewCharacterObject();
    
    if (charId === 'new') currentEditingCharacter = 'new';

    container.innerHTML = `
        <div class="character-detail">
            <div class="card-header">
                <span class="card-title">${charId === 'new' ? 'Karakter Baru' : 'Edit Karakter'}</span>
                <div>
                    <button onclick="saveCharacter()" class="btn-primary" style="margin-right: 10px;">
                        <i class="fas fa-save"></i> Simpan
                    </button>
                    <button onclick="backToCharacterList()" class="btn-secondary">
                        <i class="fas fa-arrow-left"></i> Kembali
                    </button>
                </div>
            </div>

            <div class="character-section">
                <h3><i class="fas fa-info-circle"></i> Informasi Dasar</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label>Nama Lengkap</label>
                        <input type="text" id="char-name" value="${char.name || ''}" placeholder="Nama karakter...">
                    </div>
                    <div class="form-group">
                        <label>Role dalam Cerita</label>
                        <select id="char-role">
                            <option value="protagonist" ${char.role === 'protagonist' ? 'selected' : ''}>Protagonist (MC)</option>
                            <option value="antagonist" ${char.role === 'antagonist' ? 'selected' : ''}>Antagonist</option>
                            <option value="deuteragonist" ${char.role === 'deuteragonist' ? 'selected' : ''}>Deuteragonist</option>
                            <option value="sidekick" ${char.role === 'sidekick' ? 'selected' : ''}>Sidekick</option>
                            <option value="mentor" ${char.role === 'mentor' ? 'selected' : ''}>Mentor</option>
                            <option value="love-interest" ${char.role === 'love-interest' ? 'selected' : ''}>Love Interest</option>
                            <option value="supporting" ${char.role === 'supporting' ? 'selected' : ''}>Supporting</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Usia</label>
                        <input type="text" id="char-age" value="${char.age || ''}" placeholder="25 tahun">
                    </div>
                    <div class="form-group">
                        <label>Pekerjaan</label>
                        <input type="text" id="char-occupation" value="${char.occupation || ''}" placeholder="Petani, Pelajar, dll">
                    </div>
                </div>
            </div>

            <div class="character-section">
                <h3><i class="fas fa-brain"></i> Psikologi & Motivasi</h3>
                <div class="form-group">
                    <label>Goal (Tujuan)</label>
                    <input type="text" id="char-goal" value="${char.arc?.goal || ''}" placeholder="Apa yang ingin dicapai karakter?">
                </div>
                <div class="form-group">
                    <label>Motivation (Motivasi)</label>
                    <textarea id="char-motivation" rows="2" placeholder="Mengapa mereka menginginkan goal tersebut?">${char.arc?.motivation || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Stakes (Risiko)</label>
                    <textarea id="char-stakes" rows="2" placeholder="Apa yang hilang jika gagal?">${char.arc?.stakes || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Core Wound (Luka Batin)</label>
                    <textarea id="char-wound" rows="2" placeholder="Trauma atau pengalaman masa lalu yang membentuknya...">${char.psychology?.coreWound || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Lie They Believe (Kebohongan yang Dipercaya)</label>
                    <input type="text" id="char-lie" value="${char.psychology?.lie || ''}" placeholder="Contoh: 'Cinta itu lemah'">
                </div>
                <div class="form-group">
                    <label>Truth They Need (Kebenaran yang Dibutuhkan)</label>
                    <input type="text" id="char-truth" value="${char.psychology?.truth || ''}" placeholder="Contoh: 'Cinta itu kekuatan'">
                </div>
            </div>

            <div class="character-section">
                <h3><i class="fas fa-chart-line"></i> Character Arc</h3>
                <div class="form-group">
                    <label>Tipe Arc</label>
                    <select id="char-arc-type">
                        <option value="change" ${char.arc?.type === 'change' ? 'selected' : ''}>Change (Berubah)</option>
                        <option value="growth" ${char.arc?.type === 'growth' ? 'selected' : ''}>Growth (Berkembang)</option>
                        <option value="fall" ${char.arc?.type === 'fall' ? 'selected' : ''}>Fall (Jatuh)</option>
                        <option value="flat" ${char.arc?.type === 'flat' ? 'selected' : ''}>Flat (Tetap)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Starting State (Keadaan Awal)</label>
                    <textarea id="char-start" rows="2" placeholder="Seperti apa karakter di awal cerita?">${char.arc?.startingState || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Ending State (Keadaan Akhir)</label>
                    <textarea id="char-end" rows="2" placeholder="Seperti apa karakter di akhir cerita?">${char.arc?.endingState || ''}</textarea>
                </div>
            </div>

            <div class="character-section">
                <h3><i class="fas fa-heart"></i> Karakteristik</h3>
                <div class="form-group">
                    <label>Strengths (Kekuatan)</label>
                    <textarea id="char-strengths" rows="2" placeholder="Kelebihan karakter...">${char.traits?.strengths || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Weaknesses (Kelemahan)</label>
                    <textarea id="char-weaknesses" rows="2" placeholder="Kekurangan/flaw karakter...">${char.traits?.weaknesses || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Fears (Ketakutan)</label>
                    <textarea id="char-fears" rows="2" placeholder="Apa yang ditakuti karakter?">${char.psychology?.fears || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Desires (Keinginan)</label>
                    <textarea id="char-desires" rows="2" placeholder="Apa yang paling diinginkan?">${char.psychology?.desires || ''}</textarea>
                </div>
            </div>

            <div class="character-section">
                <h3><i class="fas fa-comment"></i> Voice & Mannerism</h3>
                <div class="form-group">
                    <label>Speech Pattern (Cara Bicara)</label>
                    <textarea id="char-speech" rows="2" placeholder="Formal/kasar/dialek tertentu...">${char.voice?.speechPattern || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Habits & Quirks (Kebiasaan)</label>
                    <textarea id="char-habits" rows="2" placeholder="Gerakan khas, kebiasaan unik...">${char.voice?.habits || ''}</textarea>
                </div>
            </div>

            <div class="character-section">
                <h3><i class="fas fa-link"></i> Relationships</h3>
                <div id="relationships-list" class="relationship-list">
                    ${renderRelationships(char.relationships || [])}
                </div>
                <button onclick="addRelationship()" class="btn-secondary" style="margin-top: 10px;">
                    <i class="fas fa-plus"></i> Tambah Relasi
                </button>
            </div>

            <div style="margin-top: 30px; text-align: right;">
                <button onclick="saveCharacter()" class="btn-primary" style="margin-right: 10px;">
                    <i class="fas fa-save"></i> Simpan Karakter
                </button>
                <button onclick="backToCharacterList()" class="btn-secondary">
                    Batal
                </button>
            </div>
        </div>
    `;
}

function renderRelationships(rels) {
    if (rels.length === 0) return '<p style="color: var(--text-muted);">Belum ada relasi</p>';
    
    return rels.map((rel, idx) => `
        <div class="relationship-item">
            <div>
                <strong>${rel.characterName || 'Unknown'}</strong> - ${rel.type || 'relasi'}
                <div style="color: var(--text-muted); font-size: 0.85rem;">${rel.dynamic || ''}</div>
            </div>
            <button onclick="removeRelationship(${idx})" class="btn-icon" style="color: var(--danger);">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

function createNewCharacterObject() {
    return {
        id: storage.generateId(),
        name: '',
        role: 'supporting',
        age: '',
        occupation: '',
        psychology: {},
        arc: {},
        traits: {},
        voice: {},
        relationships: []
    };
}

function addNewCharacter() {
    currentEditingCharacter = 'new';
    renderCharacters(document.getElementById('content-area'));
}

function editCharacter(charId) {
    currentEditingCharacter = charId;
    renderCharacters(document.getElementById('content-area'));
}

function backToCharacterList() {
    currentEditingCharacter = null;
    renderCharacters(document.getElementById('content-area'));
}

async function saveCharacter() {
    const project = storage.currentProject;
    if (!project) return;

    const charData = {
        id: currentEditingCharacter === 'new' ? storage.generateId() : currentEditingCharacter,
        name: document.getElementById('char-name').value,
        role: document.getElementById('char-role').value,
        age: document.getElementById('char-age').value,
        occupation: document.getElementById('char-occupation').value,
        psychology: {
            coreWound: document.getElementById('char-wound').value,
            lie: document.getElementById('char-lie').value,
            truth: document.getElementById('char-truth').value,
            fears: document.getElementById('char-fears').value,
            desires: document.getElementById('char-desires').value
        },
        arc: {
            goal: document.getElementById('char-goal').value,
            motivation: document.getElementById('char-motivation').value,
            stakes: document.getElementById('char-stakes').value,
            type: document.getElementById('char-arc-type').value,
            startingState: document.getElementById('char-start').value,
            endingState: document.getElementById('char-end').value
        },
        traits: {
            strengths: document.getElementById('char-strengths').value,
            weaknesses: document.getElementById('char-weaknesses').value
        },
        voice: {
            speechPattern: document.getElementById('char-speech').value,
            habits: document.getElementById('char-habits').value
        },
        relationships: [] // Simplified for now
    };

    if (currentEditingCharacter === 'new') {
        project.characters.push(charData);
    } else {
        const idx = project.characters.findIndex(c => c.id === currentEditingCharacter);
        if (idx !== -1) {
            charData.relationships = project.characters[idx].relationships || [];
            project.characters[idx] = charData;
        }
    }

    await PlotWeaveApp.saveCurrentProject();
    currentEditingCharacter = null;
    renderCharacters(document.getElementById('content-area'));
}

function deleteCharacter(charId) {
    if (!confirm('Hapus karakter ini?')) return;
    
    const project = storage.currentProject;
    project.characters = project.characters.filter(c => c.id !== charId);
    
    PlotWeaveApp.saveCurrentProject().then(() => {
        renderCharacters(document.getElementById('content-area'));
    });
}

function addRelationship() {
    const name = prompt('Nama karakter yang berelasi:');
    if (!name) return;
    
    const type = prompt('Tipe relasi (friend, enemy, family, lover, dll):');
    const dynamic = prompt('Dinamika relasi:');
    
    const project = storage.currentProject;
    const char = project.characters.find(c => c.id === currentEditingCharacter);
    if (char) {
        char.relationships = char.relationships || [];
        char.relationships.push({ characterName: name, type: type || 'relasi', dynamic: dynamic || '' });
        document.getElementById('relationships-list').innerHTML = renderRelationships(char.relationships);
    }
}

function removeRelationship(idx) {
    const project = storage.currentProject;
    const char = project.characters.find(c => c.id === currentEditingCharacter);
    if (char && char.relationships) {
        char.relationships.splice(idx, 1);
        document.getElementById('relationships-list').innerHTML = renderRelationships(char.relationships);
    }
}
