document.addEventListener('DOMContentLoaded', () => {
    let facilitiesData = [];
    const grid = document.getElementById('facilities-list');
    const noResults = document.getElementById('no-results');
    const statusFilters = document.getElementById('type-filters'); // Wait, I named it type-filters in HTML
    const dimensionFilters = document.getElementById('dimension-filters');
    const searchInput = document.getElementById('facility-search');
    
    // Modal Elements
    const modal = document.getElementById('facility-modal');
    const closeModal = document.querySelector('.close-modal');
    
    // Initial State
    let currentFilters = {
        type: 'all',
        dimension: 'all',
        search: ''
    };

    let currentDetailItem = null;

    // 1. Fetch Data
    fetch('data/facilities.json')
        .then(response => response.json())
        .then(data => {
            facilitiesData = data;
            renderGrid();
        })
        .catch(err => {
            console.error('Error loading facilities:', err);
            grid.innerHTML = '<p class="error">无法加载设施数据。</p>';
        });

    // 2. Event Listeners
    
    // Type Filter
    statusFilters.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            // Remove active class from siblings
            Array.from(statusFilters.children).forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            
            currentFilters.type = e.target.dataset.filter;
            renderGrid();
        }
    });

    // Dimension Filter
    dimensionFilters.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            Array.from(dimensionFilters.children).forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            
            currentFilters.dimension = e.target.dataset.filter;
            renderGrid();
        }
    });

    // Search
    searchInput.addEventListener('input', (e) => {
        currentFilters.search = e.target.value.toLowerCase().trim();
        renderGrid();
    });

    // Modal Close
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Enable scrolling
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // 3. Render Functions
    function renderGrid() {
        grid.innerHTML = '';
        
        const filtered = facilitiesData.filter(item => {
            const matchType = currentFilters.type === 'all' || item.type === currentFilters.type;
            const matchDim = currentFilters.dimension === 'all' || item.dimension === currentFilters.dimension;
            const matchSearch = !currentFilters.search || 
                                item.title.toLowerCase().includes(currentFilters.search) || 
                                item.intro.toLowerCase().includes(currentFilters.search);
            return matchType && matchDim && matchSearch;
        });

        if (filtered.length === 0) {
            noResults.classList.remove('is-hidden');
            return;
        } else {
            noResults.classList.add('is-hidden');
        }

        filtered.forEach(item => {
            const card = document.createElement('div');
            card.className = 'facility-card';
            card.onclick = () => openModal(item);

            const statusColor = getStatusColor(item.status);
            const statusText = getStatusText(item.status);
            
            card.innerHTML = `
                <div class="card-header">
                    <h3 class="card-title">${item.title}</h3>
                    <div class="status-indicator-badge status-${item.status}">
                         <div class="status-dot"></div>
                         <span>${statusText}</span>
                    </div>
                </div>
                <p class="card-intro">${item.intro}</p>
                <div class="card-meta">
                    <span class="meta-tag">${getTypeText(item.type)}</span>
                    <span class="meta-tag">${getDimensionText(item.dimension)}</span>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    function openModal(item) {
        currentDetailItem = item;
        // Populate specific fields
        document.getElementById('modal-title').innerText = item.title;
        document.getElementById('modal-intro').innerText = item.intro;
        
        // Badges
        const badgesContainer = document.getElementById('modal-badges');
        badgesContainer.innerHTML = '';
        
        // Status Badge
        const statusBadge = document.createElement('span');
        statusBadge.className = `badge badge-status-${item.status} large-badge`;
        statusBadge.innerHTML = `<i class="fas ${getStatusIcon(item.status)}"></i> ${getStatusText(item.status)}`;
        badgesContainer.appendChild(statusBadge);

        // Type Badge
        const typeBadge = document.createElement('span');
        typeBadge.className = 'badge badge-type large-badge';
        typeBadge.innerHTML = `<i class="fas fa-cube"></i> ${getTypeText(item.type)}`;
        badgesContainer.appendChild(typeBadge);
        
        // Location
        document.getElementById('modal-dimension').innerText = getDimensionText(item.dimension);
        const coords = item.coordinates;
        document.getElementById('modal-coords').innerText = `X: ${coords.x}, Y: ${coords.y}, Z: ${coords.z}`;
        
        // Map Link
        const mapLink = document.getElementById('modal-map-link');
        const worldName = getMapWorldName(item.dimension);
        // Format: #world:X:Y:Z:88:0:0:0:1:flat
        mapLink.href = `https://mcmap.lunadeer.cn/#${worldName}:${coords.x}:${coords.y}:${coords.z}:500:0:0:0:1:flat`;

        // Contributors
        const contribList = document.getElementById('modal-contributors');
        contribList.innerHTML = '';
        if (item.contributors && item.contributors.length > 0) {
            item.contributors.forEach(name => {
                const tag = document.createElement('div');
                tag.className = 'contributor-tag';
                // Using minotar for avatar
                tag.innerHTML = `<img src="https://minotar.net/avatar/${name}/20" alt="${name}">${name}`;
                contribList.appendChild(tag);
            });
        } else {
            contribList.innerHTML = '<span class="text-secondary">暂无记录</span>';
        }

        // Instructions
        renderContentList(document.getElementById('modal-instructions'), item.instructions);

        // Notes
        renderContentList(document.getElementById('modal-notes'), item.notes);

        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent scrolling background
    }

    function renderContentList(container, list) {
        container.innerHTML = '';
        if (!list || list.length === 0) {
            container.innerHTML = '<p>无</p>';
            return;
        }
        list.forEach(block => {
            if (block.type === 'text') {
                const p = document.createElement('p');
                p.innerText = block.content;
                container.appendChild(p);
            } else if (block.type === 'image') {
                const img = document.createElement('img');
                img.src = block.content;
                img.loading = 'lazy';
                container.appendChild(img);
            }
        });
    }

    // Helpers
    function getStatusText(status) {
        const map = {
            'online': '正常运行',
            'maintenance': '维护中',
            'offline': '暂时失效'
        };
        return map[status] || status;
    }

    function getStatusColor(status) {
        const map = {
            'online': 'status-online',
            'maintenance': 'status-maintenance',
            'offline': 'status-offline'
        };
        return map[status] || '';
    }

    function getStatusIcon(status) {
        const map = {
            'online': 'fa-check-circle',
            'maintenance': 'fa-wrench',
            'offline': 'fa-times-circle'
        };
        return map[status] || 'fa-info-circle';
    }

    function getTypeText(type) {
        const map = {
            'resource': '资源类',
            'xp': '经验类',
            'infrastructure': '基础设施'
        };
        return map[type] || type;
    }
    
    function getDimensionText(dim) {
        const map = {
            'overworld': '主世界',
            'nether': '下界',
            'end': '末地'
        };
        return map[dim] || dim;
    }

    function getMapWorldName(dim) {
        const map = {
            'overworld': 'world',
            'nether': 'world_nether',
            'end': 'world_the_end'
        };
        return map[dim] || 'world';
    }

    // ========== Editor Modal Logic ==========

    const editorModal = document.getElementById('editor-modal');
    const jsonOutputModal = document.getElementById('json-output-modal');
    const closeEditorModal = document.querySelector('.close-editor-modal');
    const closeJsonModal = document.querySelector('.close-json-modal');

    // Open empty editor for new facility
    document.getElementById('btn-add-facility').addEventListener('click', () => {
        openEditor(null);
    });

    // Open editor from detail modal
    document.getElementById('btn-edit-facility').addEventListener('click', () => {
        if (currentDetailItem) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            openEditor(currentDetailItem);
        }
    });

    // Close editor modal
    closeEditorModal.addEventListener('click', () => {
        editorModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
    window.addEventListener('click', (e) => {
        if (e.target === editorModal) {
            editorModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        if (e.target === jsonOutputModal) {
            jsonOutputModal.style.display = 'none';
        }
    });
    closeJsonModal.addEventListener('click', () => {
        jsonOutputModal.style.display = 'none';
    });

    // State for editor
    let editorContributors = [];
    let editorInstructions = [];
    let editorNotes = [];

    // Initialize custom selects
    document.querySelectorAll('.custom-select').forEach(select => {
        const trigger = select.querySelector('.custom-select-trigger');
        const options = select.querySelectorAll('.custom-option');
        const input = select.querySelector('input[type="hidden"]');
        const text = select.querySelector('.custom-select-text');

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = select.classList.contains('open');
            // Close all others
            document.querySelectorAll('.custom-select').forEach(s => s.classList.remove('open'));
            if (!isOpen) {
                select.classList.add('open');
            }
        });

        options.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // Update selection visually
                options.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                text.innerText = option.innerText;
                
                // Update hidden input and trigger change
                input.value = option.dataset.value;
                input.dispatchEvent(new Event('change'));
                
                // Close dropdown
                select.classList.remove('open');
            });
        });
    });

    // Close custom selects on outside click
    document.addEventListener('click', () => {
        document.querySelectorAll('.custom-select').forEach(s => s.classList.remove('open'));
    });

    function setCustomSelectValue(id, value) {
        const input = document.getElementById(id);
        if (!input) return;
        const select = input.closest('.custom-select');
        const option = select.querySelector(`.custom-option[data-value="${value}"]`);
        
        if (option) {
            input.value = value;
            select.querySelector('.custom-select-text').innerText = option.innerText;
            select.querySelectorAll('.custom-option').forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
        }
    }

    function openEditor(item) {
        // Reset state
        editorContributors = item ? [...item.contributors] : [];
        editorInstructions = item ? item.instructions.map(i => ({...i})) : [];
        editorNotes = item ? item.notes.map(n => ({...n})) : [];

        // Populate form fields
        document.getElementById('editor-title').value = item ? item.title : '';
        document.getElementById('editor-intro').value = item ? item.intro : '';
        
        setCustomSelectValue('editor-type', item ? item.type : 'resource');
        setCustomSelectValue('editor-status', item ? item.status : 'online');
        setCustomSelectValue('editor-dimension', item ? item.dimension : 'overworld');
        
        document.getElementById('editor-x').value = item ? item.coordinates.x : '';
        document.getElementById('editor-y').value = item ? item.coordinates.y : '';
        document.getElementById('editor-z').value = item ? item.coordinates.z : '';

        renderContributorTags();
        renderSortableList('editor-instructions-list', editorInstructions);
        renderSortableList('editor-notes-list', editorNotes);
        updatePreview();

        editorModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    // --- Contributors tags ---
    function renderContributorTags() {
        const container = document.getElementById('editor-contributors-tags');
        container.innerHTML = '';
        editorContributors.forEach((name, idx) => {
            const tag = document.createElement('span');
            tag.className = 'editor-tag';
            tag.innerHTML = `${name} <span class="editor-tag-remove" data-idx="${idx}"><i class="fas fa-times"></i></span>`;
            container.appendChild(tag);
        });
    }

    document.getElementById('editor-contributors-tags').addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.editor-tag-remove');
        if (removeBtn) {
            const idx = parseInt(removeBtn.dataset.idx);
            editorContributors.splice(idx, 1);
            renderContributorTags();
            updatePreview();
        }
    });

    document.getElementById('editor-contributor-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const val = e.target.value.trim();
            if (val && !editorContributors.includes(val)) {
                editorContributors.push(val);
                renderContributorTags();
                updatePreview();
            }
            e.target.value = '';
        }
    });

    // Click on wrapper focuses input
    document.getElementById('editor-contributors-wrapper').addEventListener('click', () => {
        document.getElementById('editor-contributor-input').focus();
    });

    // --- Sortable Lists (drag-and-drop) ---
    let dragState = { listId: null, fromIdx: null };

    function renderSortableList(listId, items) {
        const container = document.getElementById(listId);
        container.innerHTML = '';
        items.forEach((item, idx) => {
            const div = document.createElement('div');
            div.className = 'sortable-item';
            div.draggable = true;
            div.dataset.idx = idx;
            div.dataset.listId = listId;

            const isText = item.type === 'text';
            div.innerHTML = `
                <span class="drag-handle"><i class="fas fa-grip-vertical"></i></span>
                <span class="item-type-badge ${isText ? 'badge-text' : 'badge-image'}">${isText ? '文字' : '图片'}</span>
                ${isText
                    ? `<textarea class="item-content" rows="2" placeholder="输入文字内容...">${escapeHtml(item.content)}</textarea>`
                    : `<input type="text" class="item-content" placeholder="输入图片URL..." value="${escapeHtml(item.content)}">`
                }
                <button type="button" class="remove-item-btn" title="删除"><i class="fas fa-trash-alt"></i></button>
            `;
            container.appendChild(div);

            // Drag events
            div.addEventListener('dragstart', onDragStart);
            div.addEventListener('dragover', onDragOver);
            div.addEventListener('dragenter', onDragEnter);
            div.addEventListener('dragleave', onDragLeave);
            div.addEventListener('drop', onDrop);
            div.addEventListener('dragend', onDragEnd);

            // Content change
            const contentEl = div.querySelector('.item-content');
            contentEl.addEventListener('input', () => {
                items[idx].content = contentEl.value;
                updatePreview();
            });

            // Remove
            div.querySelector('.remove-item-btn').addEventListener('click', () => {
                items.splice(idx, 1);
                renderSortableList(listId, items);
                updatePreview();
            });
        });
    }

    function onDragStart(e) {
        const item = e.target.closest('.sortable-item');
        if (!item) return;
        dragState.listId = item.dataset.listId;
        dragState.fromIdx = parseInt(item.dataset.idx);
        item.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', ''); // required for Firefox
    }

    function onDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    function onDragEnter(e) {
        const item = e.target.closest('.sortable-item');
        if (item && item.dataset.listId === dragState.listId) {
            item.classList.add('drag-over');
        }
    }

    function onDragLeave(e) {
        const item = e.target.closest('.sortable-item');
        if (item) {
            item.classList.remove('drag-over');
        }
    }

    function onDrop(e) {
        e.preventDefault();
        const item = e.target.closest('.sortable-item');
        if (!item || item.dataset.listId !== dragState.listId) return;
        const toIdx = parseInt(item.dataset.idx);
        const fromIdx = dragState.fromIdx;
        if (fromIdx === toIdx) return;

        const listId = dragState.listId;
        const items = listId === 'editor-instructions-list' ? editorInstructions : editorNotes;

        // Reorder
        const [moved] = items.splice(fromIdx, 1);
        items.splice(toIdx, 0, moved);

        renderSortableList(listId, items);
        updatePreview();
    }

    function onDragEnd(e) {
        document.querySelectorAll('.sortable-item').forEach(el => {
            el.classList.remove('dragging', 'drag-over');
        });
        dragState = { listId: null, fromIdx: null };
    }

    // --- Add item buttons ---
    document.querySelectorAll('.add-item-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.target; // 'instructions' or 'notes'
            const type = btn.dataset.type;     // 'text' or 'image'
            const newItem = { type: type, content: '' };
            
            if (target === 'instructions') {
                editorInstructions.push(newItem);
                renderSortableList('editor-instructions-list', editorInstructions);
            } else {
                editorNotes.push(newItem);
                renderSortableList('editor-notes-list', editorNotes);
            }
            updatePreview();
        });
    });

    // --- Live Preview ---
    // Listen for form field changes to update preview
    ['editor-title', 'editor-intro', 'editor-type', 'editor-status',
     'editor-dimension', 'editor-x', 'editor-y', 'editor-z'].forEach(id => {
        document.getElementById(id).addEventListener('input', updatePreview);
        document.getElementById(id).addEventListener('change', updatePreview);
    });

    function updatePreview() {
        const preview = document.getElementById('editor-preview-area');
        const title = document.getElementById('editor-title').value || '未命名设施';
        const intro = document.getElementById('editor-intro').value || '暂无简介';
        const type = document.getElementById('editor-type').value;
        const status = document.getElementById('editor-status').value;
        const dimension = document.getElementById('editor-dimension').value;
        const x = document.getElementById('editor-x').value || '0';
        const y = document.getElementById('editor-y').value || '64';
        const z = document.getElementById('editor-z').value || '0';

        const statusText = getStatusText(status);
        const statusIcon = getStatusIcon(status);
        const typeText = getTypeText(type);
        const dimensionText = getDimensionText(dimension);

        let html = `<div class="preview-facility">`;
        html += `<div class="preview-header">`;
        html += `<div class="preview-title">${escapeHtml(title)}</div>`;
        html += `<div class="modal-badges">`;
        html += `<span class="badge badge-status-${status} large-badge"><i class="fas ${statusIcon}"></i> ${statusText}</span>`;
        html += `<span class="badge badge-type large-badge"><i class="fas fa-cube"></i> ${typeText}</span>`;
        html += `</div>`;
        html += `</div>`;

        html += `<div class="preview-body">`;
        html += `<p class="preview-intro">${escapeHtml(intro)}</p>`;

        // Location
        html += `<div class="modal-section">`;
        html += `<h4 class="modal-section-title"><i class="fas fa-map-marker-alt"></i> 位置信息</h4>`;
        html += `<p>${dimensionText}: X: ${escapeHtml(x)}, Y: ${escapeHtml(y)}, Z: ${escapeHtml(z)}</p>`;
        html += `</div>`;

        // Contributors
        html += `<div class="modal-section">`;
        html += `<h4 class="modal-section-title"><i class="fas fa-users-cog"></i> 贡献/维护人员</h4>`;
        if (editorContributors.length > 0) {
            html += `<div class="contributors-list">`;
            editorContributors.forEach(name => {
                html += `<div class="contributor-tag"><img src="https://minotar.net/avatar/${encodeURIComponent(name)}/20" alt="${escapeHtml(name)}">${escapeHtml(name)}</div>`;
            });
            html += `</div>`;
        } else {
            html += `<span class="text-secondary">暂无记录</span>`;
        }
        html += `</div>`;

        // Instructions
        html += `<div class="modal-section">`;
        html += `<h4 class="modal-section-title"><i class="fas fa-book-open"></i> 使用说明</h4>`;
        html += `<div class="instruction-content">`;
        if (editorInstructions.length > 0) {
            editorInstructions.forEach(block => {
                if (block.type === 'text') {
                    html += `<p>${escapeHtml(block.content) || '<span class=\"text-secondary\">空文字</span>'}</p>`;
                } else {
                    html += block.content ? `<img src="${escapeHtml(block.content)}" loading="lazy">` : '<p class="text-secondary">空图片</p>';
                }
            });
        } else {
            html += `<p>无</p>`;
        }
        html += `</div></div>`;

        // Notes
        html += `<div class="modal-section">`;
        html += `<h4 class="modal-section-title"><i class="fas fa-exclamation-triangle"></i> 注意事项</h4>`;
        html += `<div class="notes-content">`;
        if (editorNotes.length > 0) {
            editorNotes.forEach(block => {
                if (block.type === 'text') {
                    html += `<p>${escapeHtml(block.content) || '<span class=\"text-secondary\">空文字</span>'}</p>`;
                } else {
                    html += block.content ? `<img src="${escapeHtml(block.content)}" loading="lazy">` : '<p class="text-secondary">空图片</p>';
                }
            });
        } else {
            html += `<p>无</p>`;
        }
        html += `</div></div>`;

        html += `</div></div>`;
        preview.innerHTML = html;
    }

    // --- Save / Generate JSON ---
    document.getElementById('btn-save-facility').addEventListener('click', () => {
        const title = document.getElementById('editor-title').value.trim();
        if (!title) {
            alert('请填写设施名称');
            document.getElementById('editor-title').focus();
            return;
        }

        const facilityObj = {
            title: title,
            intro: document.getElementById('editor-intro').value.trim(),
            type: document.getElementById('editor-type').value,
            dimension: document.getElementById('editor-dimension').value,
            status: document.getElementById('editor-status').value,
            coordinates: {
                x: parseInt(document.getElementById('editor-x').value) || 0,
                y: parseInt(document.getElementById('editor-y').value) || 64,
                z: parseInt(document.getElementById('editor-z').value) || 0
            },
            contributors: [...editorContributors],
            instructions: editorInstructions.filter(i => i.content.trim() !== ''),
            notes: editorNotes.filter(n => n.content.trim() !== '')
        };

        const jsonStr = JSON.stringify(facilityObj, null, 4);
        document.getElementById('json-output').value = jsonStr;

        jsonOutputModal.style.display = 'block';
    });

    // --- Copy JSON ---
    document.getElementById('btn-copy-json').addEventListener('click', () => {
        const textArea = document.getElementById('json-output');
        textArea.select();
        textArea.setSelectionRange(0, 99999);
        
        navigator.clipboard.writeText(textArea.value).then(() => {
            const btn = document.getElementById('btn-copy-json');
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> 已复制！';
            btn.style.background = '#34c759';
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.background = '';
            }, 2000);
        }).catch(() => {
            // Fallback
            document.execCommand('copy');
            alert('已复制到剪贴板');
        });
    });

    // --- Utility ---
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(text));
        return div.innerHTML;
    }
});
