window.addEventListener('load-view', (e) => {
    if (e.detail.view === 'story-bible') {
        renderStoryBible(e.detail.container);
    }
});

function renderStoryBible(container) {
    const project = storage.currentProject;
    
    if (!project) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-book" style="font-size: 4rem; color: var(--accent-primary); margin-bottom: 20px;"></i>
                <h2>Belum Ada Proyek</h2>
                <p>Buat proyek terlebih dahulu untuk mengakses Story Bible.</p>
            </div>
        `;
        return;
    }

    const bible = project.storyBible || {};
    const premise = bible.premise || {};
    const structure = bible.structure || { act1: {}, act2: {}, act3: {} };

    container.innerHTML = `
        <div class="story-bible-content">
            <div class="bible-tabs">
                <button class="tab-btn active" data-tab="premise" onclick="switchTab('premise')">
                    <i class="fas fa-lightbulb"></i> Premise
                </button>
                <button class="tab-btn" data-tab="structure" onclick="switchTab('structure')">
                    <i class="fas fa-sitemap"></i> Three-Act Structure
                </button>
                <button class="tab-btn" data-tab="theme" onclick="switchTab('theme')">
                    <i class="fas fa-palette"></i> Tema & Tone
                </button>
            </div>

            <div id="tab-premise" class="tab-content active">
                <div class="card">
                    <div class="card-header">
                        <span class="card-title">Logline</span>
                        <small style="color: var(--text-muted);">Satu kalimat yang menjual cerita</small>
                    </div>
                    <div class="form-group">
                        <textarea id="logline" rows="2" placeholder="Contoh: Seorang petani muda harus melawan kerajaan jahat untuk menyelamatkan desanya...">${premise.logline || ''}</textarea>
                        <small style="color: var(--text-muted);">Format: [Karakter] harus [Goal] untuk [Stakes]</small>
                    </div>
                    <button onclick="savePremise()" class="btn-primary">
                        <i class="fas fa-save"></i> Simpan Logline
                    </button>
                </div>

                <div class="card">
                    <div class="card-header">
                        <span class="card-title">Premise Lengkap</span>
                        <small style="color: var(--text-muted);">Paragraf pendek inti cerita</small>
                    </div>
                    <div class="form-group">
                        <textarea id="premise-text" rows="6" placeholder="Jelaskan: What if... So what...">${premise.premise || ''}</textarea>
                    </div>
                    <button onclick="savePremise()" class="btn-primary">
                        <i class="fas fa-save"></i> Simpan Premise
                    </button>
                </div>

                <div class="card">
                    <div class="card-header">
                        <span class="card-title">Central Conflict</span>
                        <small style="color: var(--text-muted);">Konflik utama yang menggerakkan cerita</small>
                    </div>
                    <div class="form-group">
                        <label>Konflik Internal (Emosi/Psikologis)</label>
                        <textarea id="conflict-internal" rows="3" placeholder="Contoh: Rasa takut akan kegagalan...">${premise.centralConflict?.internal || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Konflik Eksternal (Fisik/Situasional)</label>
                        <textarea id="conflict-external" rows="3" placeholder="Contoh: Perang antar kerajaan...">${premise.centralConflict?.external || ''}</textarea>
                    </div>
                    <button onclick="savePremise()" class="btn-primary">
                        <i class="fas fa-save"></i> Simpan Conflict
                    </button>
                </div>
            </div>

            <div id="tab-structure" class="tab-content">
                <div class="structure-visual">
                    <div class="act-block act-1">
                        <h3>ACT I</h3>
                        <span class="act-percent">0-25%</span>
                    </div>
                    <div class="act-block act-2">
                        <h3>ACT II</h3>
                        <span class="act-percent">25-75%</span>
                    </div>
                    <div class="act-block act-3">
                        <h3>ACT III</h3>
                        <span class="act-percent">75-100%</span>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <span class="card-title"><i class="fas fa-play-circle"></i> Hook (Halaman 1)</span>
                    </div>
                    <div class="form-group">
                        <textarea id="hook" rows="3" placeholder="Apa yang membuat pembaca tertarik di halaman pertama?">${structure.act1?.hook || ''}</textarea>
                    </div>
                    <button onclick="saveStructure()" class="btn-primary">Simpan</button>
                </div>

                <div class="card">
                    <div class="card-header">
                        <span class="card-title"><i class="fas fa-exclamation-circle"></i> Inciting Incident (10%)</span>
                    </div>
                    <div class="form-group">
                        <textarea id="inciting-incident" rows="4" placeholder="Event apa yang memaksa MC keluar dari zona nyaman?">${structure.act1?.incitingIncident || ''}</textarea>
                    </div>
                    <button onclick="saveStructure()" class="btn-primary">Simpan</button>
                </div>

                <div class="card">
                    <div class="card-header">
                        <span class="card-title"><i class="fas fa-door-open"></i> First Plot Point (25%)</span>
                    </div>
                    <div class="form-group">
                        <textarea id="first-plot-point" rows="4" placeholder="Keputusan besar yang mengubah arah cerita...">${structure.act1?.firstPlotPoint || ''}</textarea>
                    </div>
                    <button onclick="saveStructure()" class="btn-primary">Simpan</button>
                </div>

                <div class="card">
                    <div class="card-header">
                        <span class="card-title"><i class="fas fa-compress-arrows-alt"></i> First Pinch Point (37%)</span>
                    </div>
                    <div class="form-group">
                        <textarea id="first-pinch" rows="3" placeholder="Momen antagonis mendominasi...">${structure.act2?.firstPinchPoint || ''}</textarea>
                    </div>
                    <button onclick="saveStructure()" class="btn-primary">Simpan</button>
                </div>

                <div class="card">
                    <div class="card-header">
                        <span class="card-title"><i class="fas fa-adjust"></i> Midpoint (50%)</span>
                    </div>
                    <div class="form-group">
                        <textarea id="midpoint" rows="4" placeholder="Perubahan besar di tengah cerita...">${structure.act2?.midpoint || ''}</textarea>
                    </div>
                    <button onclick="saveStructure()" class="btn-primary">Simpan</button>
                </div>

                <div class="card">
                    <div class="card-header">
                        <span class="card-title"><i class="fas fa-compress-arrows-alt"></i> Second Pinch Point (62%)</span>
                    </div>
                    <div class="form-group">
                        <textarea id="second-pinch" rows="3" placeholder="Tekanan maksimal dari antagonis...">${structure.act2?.secondPinchPoint || ''}</textarea>
                    </div>
                    <button onclick="saveStructure()" class="btn-primary">Simpan</button>
                </div>

                <div class="card">
                    <div class="card-header">
                        <span class="card-title"><i class="fas fa-exclamation-triangle"></i> Second Plot Point (75%)</span>
                    </div>
                    <div class="form-group">
                        <textarea id="second-plot-point" rows="3" placeholder="Kebenaran terungkap...">${structure.act2?.secondPlotPoint || ''}</textarea>
                    </div>
                    <button onclick="saveStructure()" class="btn-primary">Simpan</button>
                </div>

                <div class="card">
                    <div class="card-header">
                        <span class="card-title"><i class="fas fa-mountain"></i> Climax (90%)</span>
                    </div>
                    <div class="form-group">
                        <textarea id="climax" rows="4" placeholder="Pertarungan/konfrontasi puncak...">${structure.act3?.climax || ''}</textarea>
                    </div>
                    <button onclick="saveStructure()" class="btn-primary">Simpan</button>
                </div>

                <div class="card">
                    <div class="card-header">
                        <span class="card-title"><i class="fas fa-flag-checkered"></i> Resolution (98-100%)</span>
                    </div>
                    <div class="form-group">
                        <textarea id="resolution" rows="3" placeholder="Keadaan baru setelah konflik selesai...">${structure.act3?.resolution || ''}</textarea>
                    </div>
                    <button onclick="saveStructure()" class="btn-primary">Simpan</button>
                </div>
            </div>

            <div id="tab-theme" class="tab-content">
                <div class="card">
                    <div class="card-header">
                        <span class="card-title">Tema Utama</span>
                        <small style="color: var(--text-muted);">Pesan moral atau ide sentral</small>
                    </div>
                    <div class="form-group">
                        <input type="text" id="theme" value="${premise.theme || ''}" placeholder="Contoh: Redemption, Sacrifice...">
                    </div>
                    <div style="margin-top: 15px;">
                        <small style="color: var(--text-muted);">Tema populer:</small>
                        <div class="tag-list" style="margin-top: 8px;">
                            ${['Redemption', 'Sacrifice', 'Identity', 'Power & Corruption', 'Love', 'Revenge', 'Coming of Age', 'Good vs Evil'].map(t => 
                                `<span class="theme-tag" onclick="setTheme('${t}')">${t}</span>`
                            ).join('')}
                        </div>
                    </div>
                    <button onclick="saveTheme()" class="btn-primary" style="margin-top: 15px;">
                        <i class="fas fa-save"></i> Simpan Tema
                    </button>
                </div>

                <div class="card">
                    <div class="card-header">
                        <span class="card-title">Tone & Mood</span>
                        <small style="color: var(--text-muted);">Suasana emosional cerita</small>
                    </div>
                    <div class="form-group">
                        <label>Tone (Sikap penulis terhadap cerita)</label>
                        <select id="tone">
                            <option value="">Pilih Tone...</option>
                            <option value="dark" ${premise.tone === 'dark' ? 'selected' : ''}>Dark & Gritty</option>
                            <option value="light" ${premise.tone === 'light' ? 'selected' : ''}>Light & Humorous</option>
                            <option value="epic" ${premise.tone === 'epic' ? 'selected' : ''}>Epic & Grand</option>
                            <option value="melancholic" ${premise.tone === 'melancholic' ? 'selected' : ''}>Melancholic</option>
                            <option value="hopeful" ${premise.tone === 'hopeful' ? 'selected' : ''}>Hopeful & Uplifting</option>
                            <option value="suspenseful" ${premise.tone === 'suspenseful' ? 'selected' : ''}>Suspenseful</option>
                            <option value="romantic" ${premise.tone === 'romantic' ? 'selected' : ''}>Romantic</option>
                            <option value="satirical" ${premise.tone === 'satirical' ? 'selected' : ''}>Satirical</option>
                        </select>
                    </div>
                    <button onclick="saveTheme()" class="btn-primary">
                        <i class="fas fa-save"></i> Simpan Tone
                    </button>
                </div>
            </div>
        </div>
    `;
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `tab-${tabName}`);
    });
}

function setTheme(theme) {
    document.getElementById('theme').value = theme;
}

async function savePremise() {
    const project = storage.currentProject;
    if (!project) return;

    project.storyBible.premise = {
        logline: document.getElementById('logline')?.value || '',
        premise: document.getElementById('premise-text')?.value || '',
        theme: document.getElementById('theme')?.value || project.storyBible.premise?.theme || '',
        tone: document.getElementById('tone')?.value || project.storyBible.premise?.tone || '',
        centralConflict: {
            internal: document.getElementById('conflict-internal')?.value || '',
            external: document.getElementById('conflict-external')?.value || ''
        }
    };

    await PlotWeaveApp.saveCurrentProject();
    alert('Premise berhasil disimpan!');
}

async function saveStructure() {
    const project = storage.currentProject;
    if (!project) return;

    project.storyBible.structure = {
        act1: {
            hook: document.getElementById('hook')?.value || '',
            incitingIncident: document.getElementById('inciting-incident')?.value || '',
            firstPlotPoint: document.getElementById('first-plot-point')?.value || ''
        },
        act2: {
            firstPinchPoint: document.getElementById('first-pinch')?.value || '',
            midpoint: document.getElementById('midpoint')?.value || '',
            secondPinchPoint: document.getElementById('second-pinch')?.value || '',
            secondPlotPoint: document.getElementById('second-plot-point')?.value || ''
        },
        act3: {
            climax: document.getElementById('climax')?.value || '',
            resolution: document.getElementById('resolution')?.value || ''
        }
    };

    await PlotWeaveApp.saveCurrentProject();
    alert('Struktur berhasil disimpan!');
}

async function saveTheme() {
    const project = storage.currentProject;
    if (!project) return;

    project.storyBible.premise = project.storyBible.premise || {};
    project.storyBible.premise.theme = document.getElementById('theme')?.value || '';
    project.storyBible.premise.tone = document.getElementById('tone')?.value || '';

    await PlotWeaveApp.saveCurrentProject();
    alert('Tema berhasil disimpan!');
}
