window.addEventListener('load-view', (e) => {
    if (e.detail.view === 'worldbuilding') {
        renderWorldbuilding(e.detail.container);
    }
});

function renderWorldbuilding(container) {
    const project = storage.currentProject;
    
    if (!project) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-globe" style="font-size: 4rem; color: var(--accent-primary); margin-bottom: 20px;"></i>
                <h2>Belum Ada Proyek</h2>
                <p>Buat proyek terlebih dahulu untuk mengelola world building.</p>
            </div>
        `;
        return;
    }

    const world = project.worldBuilding || { magicSystem: { rules: [], limitations: [], costs: [] }, locations: [], history: [] };
    
    container.innerHTML = `
        <div class="worldbuilding-content">
            <div class="bible-tabs">
                <button class="tab-btn active" data-tab="magic" onclick="switchWorldTab('magic')">
                    <i class="fas fa-magic"></i> Magic System
                </button>
                <button class="tab-btn" data-tab="locations" onclick="switchWorldTab('locations')">
                    <i class="fas fa-map-marker-alt"></i> Lokasi
                </button>
                <button class="tab-btn" data-tab="history" onclick="switchWorldTab('history')">
                    <i class="fas fa-history"></i> Sejarah
                </button>
                <button class="tab-btn" data-tab="culture" onclick="switchWorldTab('culture')">
                    <i class="fas fa-users"></i> Budaya
                </button>
            </div>

            <div id="world-tab-magic" class="tab-content active">
                <div class="card">
                    <div class="card-header">
                        <span class="card-title">Magic System / Technology Rules</span>
                    </div>
                    
                    <h4 style="margin-bottom: 15px; color: var(--accent-primary);"><i class="fas fa-check-circle"></i> Rules (Aturan)</h4>
                    <div id="magic-rules-list">
                        ${renderMagicList(world.magicSystem?.rules || [], 'rules')}
                    </div>
                    <button onclick="addMagicItem('rules')" class="btn-secondary" style="margin-bottom: 20px;">
                        <i class="fas fa-plus"></i> Tambah Rule
                    </button>

                    <h4 style="margin-bottom: 15px; color: var(--accent-primary);"><i class="fas fa-ban"></i> Limitations (Keterbatasan)</h4>
                    <div id="magic-limitations-list">
                        ${renderMagicList(world.magicSystem?.limitations || [], 'limitations')}
                    </div>
                    <button onclick="addMagicItem('limitations')" class="btn-secondary" style="margin-bottom: 20px;">
                        <i class="fas fa-plus"></i> Tambah Limitation
                    </button>

                    <h4 style="margin-bottom: 15px; color: var(--accent-primary);"><i class="fas fa-coins"></i> Costs (Biaya)</h4>
                    <div id="magic-costs-list">
                        ${renderMagicList(world.magicSystem?.costs || [], 'costs')}
                    </div>
                    <button onclick="addMagicItem('costs')" class="btn-secondary">
                        <i class="fas fa-plus"></i> Tambah Cost
                    </button>
                </div>
            </div>

            <div id="world-tab-locations" class="tab-content">
                <div class="card">
                    <div class="card-header">
                        <span class="card-title">Lokasi & Setting</span>
                        <button onclick="addLocation()" class="btn-primary">
                            <i class="fas fa-plus"></i> Tambah Lokasi
                        </button>
                    </div>
                    <div id="locations-list">
                        ${renderLocations(world.locations || [])}
                    </div>
                </div>
            </div>

            <div id="world-tab-history" class="tab-content">
                <div class="card">
                    <div class="card-header">
                        <span class="card-title">Timeline Sejarah</span>
                        <button onclick="addHistoryEvent()" class="btn-primary">
                            <i class="fas fa-plus"></i> Tambah Event
                        </button>
                    </div>
                    <div id="history-list">
                        ${renderHistory(world.history || [])}
                    </div>
                </div>
            </div>

            <div id="world-tab-culture" class="tab-content">
                <div class="card">
                    <div class="card-header">
                        <span class="card-title">Budaya & Masyarakat</span>
                    </div>
                    <div class="form-group">
                        <label>Adat & Tradisi</label>
                        <textarea id="culture-customs" rows="4" placeholder="Adat istiadat, ritual, upacara...">${world.cultures?.customs || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Agama & Kepercayaan</label>
                        <textarea id="culture-religion" rows="4" placeholder="Sistem kepercayaan, mitologi...">${world.cultures?.religion || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Pemerintahan & Hukum</label>
                        <textarea id="culture-government" rows="4" placeholder="Struktur politik, hukum...">${world.cultures?.government || ''}</textarea>
                    </div>
                    <button onclick="saveCulture()" class="btn-primary">
                        <i class="fas fa-save"></i> Simpan Budaya
                    </button>
                </div>
            </div>
        </div>
    `;
}

function switchWorldTab(tabName) {
    document.querySelectorAll('.bible-tabs .tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `world-tab-${tabName}`);
    });
}

function renderMagicList(items, type) {
    if (items.length === 0) return '<p style="color: var(--text-muted);">Belum ada item</p>';
    
    return items.map((item, idx) => `
        <div class="rule-item">
            <span>${item}</span>
            <button onclick="removeMagicItem('${type}', ${idx})" class="btn-icon" style="color: var(--danger);">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

function addMagicItem(type) {
    const value = prompt(`Masukkan ${type} baru:`);
    if (!value) return;
    
    const project = storage.currentProject;
    project.worldBuilding.magicSystem = project.worldBuilding.magicSystem || { rules: [], limitations: [], costs: [] };
    project.worldBuilding.magicSystem[type] = project.worldBuilding.magicSystem[type] || [];
    project.worldBuilding.magicSystem[type].push(value);
    
    PlotWeaveApp.saveCurrentProject().then(() => {
        document.getElementById(`magic-${type}-list`).innerHTML = 
            renderMagicList(project.worldBuilding.magicSystem[type], type);
    });
}

function removeMagicItem(type, idx) {
    const project = storage.currentProject;
    project.worldBuilding.magicSystem[type].splice(idx, 1);
    
    PlotWeaveApp.saveCurrentProject().then(() => {
        document.getElementById(`magic-${type}-list`).innerHTML = 
            renderMagicList(project.worldBuilding.magicSystem[type], type);
    });
}

function renderLocations(locations) {
    if (locations.length === 0) return '<p style="color: var(--text-muted); text-align: center; padding: 20px;">Belum ada lokasi</p>';
    
    return locations.map((loc, idx) => `
        <div class="location-item">
            <div class="location-name">${loc.name}</div>
            <div class="location-desc">${loc.description || ''}</div>
            <div style="margin-top: 10px; color: var(--text-muted); font-size: 0.85rem;">
                <i class="fas fa-map-pin"></i> ${loc.region || 'Unknown region'} | 
                <i class="fas fa-building"></i> ${loc.type || 'Unknown type'}
            </div>
            <button onclick="removeLocation(${idx})" class="btn-icon" style="color: var(--danger); margin-top: 10px;">
                <i class="fas fa-trash"></i> Hapus
            </button>
        </div>
    `).join('');
}

function addLocation() {
    const name = prompt('Nama lokasi:');
    if (!name) return;
    
    const description = prompt('Deskripsi:');
    const region = prompt('Region/Kawasan:');
    const type = prompt('Tipe (kota, desa, dungeon, dll):');
    
    const project = storage.currentProject;
    project.worldBuilding.locations = project.worldBuilding.locations || [];
    project.worldBuilding.locations.push({ name, description, region, type });
    
    PlotWeaveApp.saveCurrentProject().then(() => {
        document.getElementById('locations-list').innerHTML = renderLocations(project.worldBuilding.locations);
    });
}

function removeLocation(idx) {
    const project = storage.currentProject;
    project.worldBuilding.locations.splice(idx, 1);
    
    PlotWeaveApp.saveCurrentProject().then(() => {
        document.getElementById('locations-list').innerHTML = renderLocations(project.worldBuilding.locations);
    });
}

function renderHistory(history) {
    if (history.length === 0) return '<p style="color: var(--text-muted); text-align: center; padding: 20px;">Belum ada event sejarah</p>';
    
    const sorted = [...history].sort((a, b) => (a.year || 0) - (b.year || 0));
    
    return sorted.map((evt, idx) => `
        <div class="location-item" style="border-left: 3px solid var(--accent-primary);">
            <div style="color: var(--accent-primary); font-weight: 600; margin-bottom: 5px;">
                Tahun ${evt.year || 'Unknown'}
            </div>
            <div class="location-name">${evt.event}</div>
            <div class="location-desc">${evt.impact || ''}</div>
            <button onclick="removeHistoryEvent(${idx})" class="btn-icon" style="color: var(--danger); margin-top: 10px;">
                <i class="fas fa-trash"></i> Hapus
            </button>
        </div>
    `).join('');
}

function addHistoryEvent() {
    const year = prompt('Tahun:');
    const event = prompt('Nama event:');
    if (!event) return;
    
    const impact = prompt('Dampak/Impact:');
    
    const project = storage.currentProject;
    project.worldBuilding.history = project.worldBuilding.history || [];
    project.worldBuilding.history.push({ year: parseInt(year) || 0, event, impact });
    
    PlotWeaveApp.saveCurrentProject().then(() => {
        document.getElementById('history-list').innerHTML = renderHistory(project.worldBuilding.history);
    });
}

function removeHistoryEvent(idx) {
    const project = storage.currentProject;
    project.worldBuilding.history.splice(idx, 1);
    
    PlotWeaveApp.saveCurrentProject().then(() => {
        document.getElementById('history-list').innerHTML = renderHistory(project.worldBuilding.history);
    });
}

async function saveCulture() {
    const project = storage.currentProject;
    project.worldBuilding.cultures = {
        customs: document.getElementById('culture-customs').value,
        religion: document.getElementById('culture-religion').value,
        government: document.getElementById('culture-government').value
    };
    
    await PlotWeaveApp.saveCurrentProject();
    alert('Data budaya berhasil disimpan!');
}
