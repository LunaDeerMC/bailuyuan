document.addEventListener('DOMContentLoaded', () => {
    const DEFAULT_GRADIENT = {
        from: '#667eea',
        to: '#764ba2'
    };

    let townsData = [];
    const grid = document.getElementById('towns-list');
    const noResults = document.getElementById('no-results');
    const scaleFilters = document.getElementById('scale-filters');
    const typeFilters = document.getElementById('type-filters');
    const recruitFilters = document.getElementById('recruit-filters');
    const searchInput = document.getElementById('town-search');

    // Modal Elements
    const modal = document.getElementById('town-modal');
    const closeModalBtn = modal.querySelector('.close-modal');

    // Initial State
    let currentFilters = {
        scale: 'all',
        townType: 'all',
        recruitment: 'all',
        search: ''
    };

    let currentDetailItem = null;

    // Generate stable anchor ID for a town
    function generateTownId(item) {
        var raw = (item.title || '');
        var hash = 0;
        for (var i = 0; i < raw.length; i++) {
            hash = ((hash << 5) - hash) + raw.charCodeAt(i);
            hash |= 0;
        }
        return 't' + Math.abs(hash).toString(36);
    }

    // Handle URL hash: auto-open town modal
    function handleHashNavigation() {
        var hash = location.hash.replace('#', '');
        if (!hash) return;
        for (var i = 0; i < townsData.length; i++) {
            if (generateTownId(townsData[i]) === hash) {
                openModal(townsData[i]);
                return;
            }
        }
    }

    // 1. Fetch Data
    fetch('data/towns.json')
        .then(response => response.json())
        .then(data => {
            townsData = data;
            renderGrid();
            handleHashNavigation();
        })
        .catch(err => {
            console.error('Error loading towns:', err);
            grid.innerHTML = '<p class="error">无法加载城镇数据。</p>';
        });

    // 2. Event Listeners

    // Scale Filter
    scaleFilters.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            Array.from(scaleFilters.children).forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            currentFilters.scale = e.target.dataset.filter;
            renderGrid();
        }
    });

    // Type Filter
    typeFilters.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            Array.from(typeFilters.children).forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            currentFilters.townType = e.target.dataset.filter;
            renderGrid();
        }
    });

    // Recruit Filter
    recruitFilters.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            Array.from(recruitFilters.children).forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            currentFilters.recruitment = e.target.dataset.filter;
            renderGrid();
        }
    });

    // Search
    searchInput.addEventListener('input', (e) => {
        currentFilters.search = e.target.value.toLowerCase().trim();
        renderGrid();
    });

    // Modal Close
    closeModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        history.replaceState(null, '', location.pathname + location.search);
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            history.replaceState(null, '', location.pathname + location.search);
        }
    });

    // 3. Render Functions
    function renderGrid() {
        grid.innerHTML = '';

        const filtered = townsData.filter(item => {
            const matchScale = currentFilters.scale === 'all' || item.scale === currentFilters.scale;
            const matchType = currentFilters.townType === 'all' || item.townType === currentFilters.townType;
            const matchRecruit = currentFilters.recruitment === 'all' || item.recruitment === currentFilters.recruitment;
            const matchSearch = !currentFilters.search ||
                item.title.toLowerCase().includes(currentFilters.search);
            return matchScale && matchType && matchRecruit && matchSearch;
        });

        if (filtered.length === 0) {
            noResults.classList.remove('is-hidden');
            return;
        } else {
            noResults.classList.add('is-hidden');
        }

        filtered.forEach(item => {
            const card = document.createElement('div');
            card.className = 'town-card';
            card.onclick = () => openModal(item);

            const hasLogo = item.logo && item.logo.trim() !== '';
            const gradient = getTownGradient(item);

            // Build card icon badges (scale + type + recruitment)
            let iconsHtml = '';
            iconsHtml += '<div class="town-card-icons">';
            iconsHtml += '<span class="town-icon-badge icon-scale-' + item.scale + '" title="' + getScaleText(item.scale) + '"><i class="fas ' + getScaleIcon(item.scale) + '"></i></span>';
            iconsHtml += '<span class="town-icon-badge icon-type-' + item.townType + '" title="' + getTownTypeText(item.townType) + '"><i class="fas ' + getTownTypeIcon(item.townType) + '"></i></span>';
            iconsHtml += '<span class="town-icon-badge icon-recruit-' + item.recruitment + '" title="' + getRecruitText(item.recruitment) + '"><i class="fas ' + getRecruitIcon(item.recruitment) + '"></i></span>';
            iconsHtml += '</div>';

            card.innerHTML =
                '<div class="town-card-bg' + (hasLogo ? '' : ' no-logo') + '"' +
                    (hasLogo ? ' style="background-image:url(\'' + escapeHtml(item.logo) + '\')"' : ' style="' + buildGradientBackgroundStyle(gradient) + '"') +
                '>' +
                    (hasLogo ? '' : '<i class="fas fa-city town-logo-placeholder"></i>') +
                    iconsHtml +
                '</div>' +
                '<div class="town-card-body">' +
                    '<h3 class="town-card-title">' + escapeHtml(item.title) + '</h3>' +
                    '<div class="town-card-meta">' +
                        '<span class="town-meta-tag"><i class="fas ' + getScaleIcon(item.scale) + '"></i> ' + getScaleText(item.scale) + '</span>' +
                        '<span class="town-meta-tag"><i class="fas ' + getTownTypeIcon(item.townType) + '"></i> ' + getTownTypeText(item.townType) + '</span>' +
                        '<span class="town-meta-tag"><i class="fas ' + getRecruitIcon(item.recruitment) + '"></i> ' + getRecruitText(item.recruitment) + '</span>' +
                    '</div>' +
                '</div>';

            grid.appendChild(card);
        });
    }

    function openModal(item) {
        currentDetailItem = item;

        // Banner
        var banner = document.getElementById('town-modal-banner');
        var hasLogo = item.logo && item.logo.trim() !== '';
        var gradient = getTownGradient(item);
        banner.className = 'town-modal-banner' + (hasLogo ? '' : ' no-logo');
        if (hasLogo) {
            banner.style.backgroundImage = "url('" + item.logo + "')";
            banner.style.background = '';
            banner.innerHTML = '';
        } else {
            banner.style.backgroundImage = '';
            banner.style.background = buildGradientBackgroundValue(gradient);
            banner.innerHTML = '<i class="fas fa-city town-banner-placeholder"></i>';
        }

        // Title
        document.getElementById('town-modal-title').innerText = item.title;

        // Badges
        var badgesContainer = document.getElementById('town-modal-badges');
        badgesContainer.innerHTML = '';

        var scaleBadge = document.createElement('span');
        scaleBadge.className = 'town-badge badge-scale-' + item.scale;
        scaleBadge.innerHTML = '<i class="fas ' + getScaleIcon(item.scale) + '"></i> ' + getScaleText(item.scale);
        badgesContainer.appendChild(scaleBadge);

        var typeBadge = document.createElement('span');
        typeBadge.className = 'town-badge badge-type-' + item.townType;
        typeBadge.innerHTML = '<i class="fas ' + getTownTypeIcon(item.townType) + '"></i> ' + getTownTypeText(item.townType);
        badgesContainer.appendChild(typeBadge);

        var recruitBadge = document.createElement('span');
        recruitBadge.className = 'town-badge badge-recruit-' + item.recruitment;
        recruitBadge.innerHTML = '<i class="fas ' + getRecruitIcon(item.recruitment) + '"></i> ' + getRecruitText(item.recruitment);
        badgesContainer.appendChild(recruitBadge);

        // Coordinates
        var coords = item.coordinates;
        document.getElementById('town-modal-coords').innerText = 'X: ' + coords.x + ', Y: ' + coords.y + ', Z: ' + coords.z;

        // Map Link
        var mapLink = document.getElementById('town-modal-map-link');
        mapLink.href = 'https://mcmap.lunadeer.cn/#world:' + coords.x + ':' + coords.y + ':' + coords.z + ':500:0:0:0:1:flat';

        // Founders
        var foundersContainer = document.getElementById('town-modal-founders');
        foundersContainer.innerHTML = '';
        if (item.founders && item.founders.length > 0) {
            item.founders.forEach(function(name) {
                var tag = document.createElement('div');
                tag.className = 'contributor-tag';
                tag.innerHTML = '<img src="https://minotar.net/avatar/' + encodeURIComponent(name) + '/20" alt="' + escapeHtml(name) + '">' + escapeHtml(name);
                foundersContainer.appendChild(tag);
            });
        } else {
            foundersContainer.innerHTML = '<span class="text-secondary">暂无记录</span>';
        }

        // Members
        var membersContainer = document.getElementById('town-modal-members');
        membersContainer.innerHTML = '';
        if (item.members && item.members.length > 0) {
            item.members.forEach(function(name) {
                var tag = document.createElement('div');
                tag.className = 'contributor-tag';
                tag.innerHTML = '<img src="https://minotar.net/avatar/' + encodeURIComponent(name) + '/20" alt="' + escapeHtml(name) + '">' + escapeHtml(name);
                membersContainer.appendChild(tag);
            });
        } else {
            membersContainer.innerHTML = '<span class="text-secondary">暂无记录</span>';
        }

        // Introduction
        renderContentList(document.getElementById('town-modal-introduction'), item.introduction);

        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';

        // Update URL hash
        var anchorId = generateTownId(item);
        history.replaceState(null, '', '#' + anchorId);
    }

    function renderContentList(container, list) {
        container.innerHTML = '';
        if (!list || list.length === 0) {
            container.innerHTML = '<p>无</p>';
            return;
        }
        list.forEach(function(block) {
            if (block.type === 'text') {
                var p = document.createElement('p');
                p.innerText = block.content;
                container.appendChild(p);
            } else if (block.type === 'image') {
                var img = document.createElement('img');
                img.src = block.content;
                img.loading = 'lazy';
                container.appendChild(img);
            } else if (block.type === 'video') {
                var bv = parseBVNumber(block.content);
                if (bv) {
                    var wrapper = document.createElement('div');
                    wrapper.className = 'video-embed-wrapper';
                    var iframe = document.createElement('iframe');
                    iframe.src = 'https://player.bilibili.com/player.html?bvid=' + bv + '&autoplay=0&high_quality=1';
                    iframe.allowFullscreen = true;
                    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups');
                    iframe.loading = 'lazy';
                    wrapper.appendChild(iframe);
                    container.appendChild(wrapper);
                } else {
                    var p = document.createElement('p');
                    p.className = 'text-secondary';
                    p.innerText = '无效的视频 BV 号';
                    container.appendChild(p);
                }
            }
        });
    }

    function parseBVNumber(input) {
        if (!input) return null;
        input = input.trim();
        var bvPattern = /^(BV[A-Za-z0-9]+)$/;
        var directMatch = input.match(bvPattern);
        if (directMatch) return directMatch[1];
        var urlPattern = /bilibili\.com\/video\/(BV[A-Za-z0-9]+)/;
        var urlMatch = input.match(urlPattern);
        if (urlMatch) return urlMatch[1];
        var generalPattern = /(BV[A-Za-z0-9]{10,})/;
        var generalMatch = input.match(generalPattern);
        if (generalMatch) return generalMatch[1];
        return null;
    }

    // Helpers
    function getScaleText(scale) {
        var map = { 'small': '小型（5人以下）', 'medium': '中型（2-10人）', 'large': '大型（10人以上）' };
        return map[scale] || scale;
    }

    function getScaleIcon(scale) {
        var map = { 'small': 'fa-user', 'medium': 'fa-users', 'large': 'fa-city' };
        return map[scale] || 'fa-users';
    }

    function getTownTypeText(type) {
        var map = { 'building': '建筑', 'adventure': '冒险', 'industry': '工业' };
        return map[type] || type;
    }

    function getTownTypeIcon(type) {
        var map = { 'building': 'fa-building', 'adventure': 'fa-dragon', 'industry': 'fa-industry' };
        return map[type] || 'fa-building';
    }

    function getRecruitText(recruitment) {
        var map = { 'welcome': '欢迎加入', 'closed': '暂不招人', 'maybe': '可以考虑' };
        return map[recruitment] || recruitment;
    }

    function getRecruitIcon(recruitment) {
        var map = { 'welcome': 'fa-door-open', 'closed': 'fa-door-closed', 'maybe': 'fa-question-circle' };
        return map[recruitment] || 'fa-info-circle';
    }

    function normalizeHexColor(value, fallback) {
        if (!value || typeof value !== 'string') return fallback;
        var trimmed = value.trim();
        if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed;
        return fallback;
    }

    function getTownGradient(item) {
        var gradient = item && item.gradient ? item.gradient : {};
        return {
            from: normalizeHexColor(gradient.from, DEFAULT_GRADIENT.from),
            to: normalizeHexColor(gradient.to, DEFAULT_GRADIENT.to)
        };
    }

    function buildGradientBackgroundValue(gradient) {
        return 'linear-gradient(135deg, ' + gradient.from + ' 0%, ' + gradient.to + ' 100%)';
    }

    function buildGradientBackgroundStyle(gradient) {
        return 'background:' + buildGradientBackgroundValue(gradient) + ';';
    }

    // Share town link
    document.getElementById('btn-share-town').addEventListener('click', function() {
        if (!currentDetailItem) return;
        var anchorId = generateTownId(currentDetailItem);
        var url = location.origin + location.pathname + '#' + anchorId;
        var btn = document.getElementById('btn-share-town');
        navigator.clipboard.writeText(url).then(function() {
            btn.innerHTML = '<i class="fas fa-check"></i> 已复制链接';
            btn.classList.add('shared');
            setTimeout(function() {
                btn.innerHTML = '<i class="fas fa-share-alt"></i> 分享';
                btn.classList.remove('shared');
            }, 2000);
        }).catch(function() {
            var tmp = document.createElement('input');
            tmp.value = url;
            document.body.appendChild(tmp);
            tmp.select();
            document.execCommand('copy');
            document.body.removeChild(tmp);
            btn.innerHTML = '<i class="fas fa-check"></i> 已复制链接';
            setTimeout(function() {
                btn.innerHTML = '<i class="fas fa-share-alt"></i> 分享';
            }, 2000);
        });
    });

    // Open editor from detail modal
    document.getElementById('btn-edit-town').addEventListener('click', function() {
        if (currentDetailItem) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            openEditor(currentDetailItem);
        }
    });

    // ========== Editor Modal Logic ==========

    var editorModal = document.getElementById('town-editor-modal');
    var jsonOutputModal = document.getElementById('town-json-output-modal');
    var closeEditorModalBtn = editorModal.querySelector('.close-editor-modal');
    var closeJsonModalBtn = jsonOutputModal.querySelector('.close-json-modal');

    // Open empty editor for new town
    document.getElementById('btn-add-town').addEventListener('click', function() {
        openEditor(null);
    });

    // Close editor modal
    closeEditorModalBtn.addEventListener('click', function() {
        editorModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
    window.addEventListener('click', function(e) {
        if (e.target === editorModal) {
            editorModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        if (e.target === jsonOutputModal) {
            jsonOutputModal.style.display = 'none';
        }
    });
    closeJsonModalBtn.addEventListener('click', function() {
        jsonOutputModal.style.display = 'none';
    });

    // State for editor
    var editorFounders = [];
    var editorMembers = [];
    var editorIntroduction = [];

    // Initialize custom selects
    editorModal.querySelectorAll('.custom-select').forEach(function(select) {
        var trigger = select.querySelector('.custom-select-trigger');
        var options = select.querySelectorAll('.custom-option');
        var input = select.querySelector('input[type="hidden"]');
        var text = select.querySelector('.custom-select-text');

        trigger.addEventListener('click', function(e) {
            e.stopPropagation();
            var isOpen = select.classList.contains('open');
            editorModal.querySelectorAll('.custom-select').forEach(function(s) { s.classList.remove('open'); });
            if (!isOpen) {
                select.classList.add('open');
            }
        });

        options.forEach(function(option) {
            option.addEventListener('click', function(e) {
                e.stopPropagation();
                options.forEach(function(opt) { opt.classList.remove('selected'); });
                option.classList.add('selected');
                text.innerText = option.innerText;
                input.value = option.dataset.value;
                input.dispatchEvent(new Event('change'));
                select.classList.remove('open');
            });
        });
    });

    document.addEventListener('click', function() {
        editorModal.querySelectorAll('.custom-select').forEach(function(s) { s.classList.remove('open'); });
    });

    function setCustomSelectValue(id, value) {
        var input = document.getElementById(id);
        if (!input) return;
        var select = input.closest('.custom-select');
        var option = select.querySelector('.custom-option[data-value="' + value + '"]');
        if (option) {
            input.value = value;
            select.querySelector('.custom-select-text').innerText = option.innerText;
            select.querySelectorAll('.custom-option').forEach(function(opt) { opt.classList.remove('selected'); });
            option.classList.add('selected');
        }
    }

    function openEditor(item) {
        var gradient = getTownGradient(item || {});
        editorFounders = item ? item.founders.slice() : [];
        editorMembers = item ? item.members.slice() : [];
        editorIntroduction = item ? item.introduction.map(function(i) { return {type: i.type, content: i.content}; }) : [];

        document.getElementById('editor-town-title').value = item ? item.title : '';
        document.getElementById('editor-town-logo').value = item ? (item.logo || '') : '';
        document.getElementById('editor-town-gradient-from').value = gradient.from;
        document.getElementById('editor-town-gradient-to').value = gradient.to;

        setCustomSelectValue('editor-town-scale', item ? item.scale : 'small');
        setCustomSelectValue('editor-town-type', item ? item.townType : 'building');
        setCustomSelectValue('editor-town-recruit', item ? item.recruitment : 'welcome');

        document.getElementById('editor-town-x').value = item ? item.coordinates.x : '';
        document.getElementById('editor-town-y').value = item ? item.coordinates.y : '';
        document.getElementById('editor-town-z').value = item ? item.coordinates.z : '';

        renderTagsList('editor-founders-tags', editorFounders);
        renderTagsList('editor-members-tags', editorMembers);
        renderSortableList('editor-introduction-list', editorIntroduction);
        updatePreview();

        editorModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    // --- Tags input helpers ---
    function renderTagsList(containerId, list) {
        var container = document.getElementById(containerId);
        container.innerHTML = '';
        list.forEach(function(name, idx) {
            var tag = document.createElement('span');
            tag.className = 'editor-tag';
            tag.innerHTML = escapeHtml(name) + ' <span class="editor-tag-remove" data-idx="' + idx + '" data-list="' + containerId + '"><i class="fas fa-times"></i></span>';
            container.appendChild(tag);
        });
    }

    function commitTagInput(inputId, list, tagsContainerId) {
        var input = document.getElementById(inputId);
        var value = input.value.trim();
        if (value && list.indexOf(value) === -1) {
            list.push(value);
            renderTagsList(tagsContainerId, list);
            updatePreview();
        }
        input.value = '';
    }

    // Founders tags
    document.getElementById('editor-founders-tags').addEventListener('click', function(e) {
        var removeBtn = e.target.closest('.editor-tag-remove');
        if (removeBtn) {
            var idx = parseInt(removeBtn.dataset.idx);
            editorFounders.splice(idx, 1);
            renderTagsList('editor-founders-tags', editorFounders);
            updatePreview();
        }
    });

    document.getElementById('editor-founder-input').addEventListener('keydown', function(e) {
        if (e.isComposing) return;
        if (e.key === 'Enter' || e.key === ' ' || e.code === 'Space') {
            e.preventDefault();
            commitTagInput('editor-founder-input', editorFounders, 'editor-founders-tags');
        }
    });
    document.getElementById('editor-founder-input').addEventListener('blur', function() {
        commitTagInput('editor-founder-input', editorFounders, 'editor-founders-tags');
    });
    document.getElementById('editor-founders-wrapper').addEventListener('click', function() {
        document.getElementById('editor-founder-input').focus();
    });

    // Members tags
    document.getElementById('editor-members-tags').addEventListener('click', function(e) {
        var removeBtn = e.target.closest('.editor-tag-remove');
        if (removeBtn) {
            var idx = parseInt(removeBtn.dataset.idx);
            editorMembers.splice(idx, 1);
            renderTagsList('editor-members-tags', editorMembers);
            updatePreview();
        }
    });

    document.getElementById('editor-member-input').addEventListener('keydown', function(e) {
        if (e.isComposing) return;
        if (e.key === 'Enter' || e.key === ' ' || e.code === 'Space') {
            e.preventDefault();
            commitTagInput('editor-member-input', editorMembers, 'editor-members-tags');
        }
    });
    document.getElementById('editor-member-input').addEventListener('blur', function() {
        commitTagInput('editor-member-input', editorMembers, 'editor-members-tags');
    });
    document.getElementById('editor-members-wrapper').addEventListener('click', function() {
        document.getElementById('editor-member-input').focus();
    });

    // --- Sortable Lists (drag-and-drop) ---
    var dragState = { listId: null, fromIdx: null };

    function renderSortableList(listId, items) {
        var container = document.getElementById(listId);
        container.innerHTML = '';
        items.forEach(function(item, idx) {
            var div = document.createElement('div');
            div.className = 'sortable-item';
            div.draggable = true;
            div.dataset.idx = idx;
            div.dataset.listId = listId;

            var typeBadgeClass = item.type === 'text' ? 'badge-text' : item.type === 'image' ? 'badge-image' : 'badge-video';
            var typeBadgeLabel = item.type === 'text' ? '文字' : item.type === 'image' ? '图片' : '视频';
            var contentHtml;
            if (item.type === 'text') {
                contentHtml = '<textarea class="item-content" rows="2" placeholder="输入文字内容...">' + escapeHtml(item.content) + '</textarea>';
            } else if (item.type === 'image') {
                contentHtml = '<input type="text" class="item-content" placeholder="输入图片URL..." value="' + escapeHtml(item.content) + '">';
            } else {
                contentHtml = '<input type="text" class="item-content" placeholder="BV1xxxxxxxxxx 或 bilibili 视频地址" value="' + escapeHtml(item.content) + '">';
            }
            div.innerHTML =
                '<span class="drag-handle"><i class="fas fa-grip-vertical"></i></span>' +
                '<span class="item-type-badge ' + typeBadgeClass + '">' + typeBadgeLabel + '</span>' +
                contentHtml +
                '<button type="button" class="remove-item-btn" title="删除"><i class="fas fa-trash-alt"></i></button>';
            container.appendChild(div);

            div.addEventListener('dragstart', onDragStart);
            div.addEventListener('dragover', onDragOver);
            div.addEventListener('dragenter', onDragEnter);
            div.addEventListener('dragleave', onDragLeave);
            div.addEventListener('drop', onDrop);
            div.addEventListener('dragend', onDragEnd);

            var contentEl = div.querySelector('.item-content');
            contentEl.addEventListener('input', function() {
                items[idx].content = contentEl.value;
                updatePreview();
            });

            div.querySelector('.remove-item-btn').addEventListener('click', function() {
                items.splice(idx, 1);
                renderSortableList(listId, items);
                updatePreview();
            });
        });
    }

    function onDragStart(e) {
        var item = e.target.closest('.sortable-item');
        if (!item) return;
        dragState.listId = item.dataset.listId;
        dragState.fromIdx = parseInt(item.dataset.idx);
        item.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', '');
    }

    function onDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    function onDragEnter(e) {
        var item = e.target.closest('.sortable-item');
        if (item && item.dataset.listId === dragState.listId) {
            item.classList.add('drag-over');
        }
    }

    function onDragLeave(e) {
        var item = e.target.closest('.sortable-item');
        if (item) {
            item.classList.remove('drag-over');
        }
    }

    function onDrop(e) {
        e.preventDefault();
        var item = e.target.closest('.sortable-item');
        if (!item || item.dataset.listId !== dragState.listId) return;
        var toIdx = parseInt(item.dataset.idx);
        var fromIdx = dragState.fromIdx;
        if (fromIdx === toIdx) return;

        var listId = dragState.listId;
        var items = editorIntroduction;

        var moved = items.splice(fromIdx, 1)[0];
        items.splice(toIdx, 0, moved);

        renderSortableList(listId, items);
        updatePreview();
    }

    function onDragEnd() {
        document.querySelectorAll('.sortable-item').forEach(function(el) {
            el.classList.remove('dragging', 'drag-over');
        });
        dragState = { listId: null, fromIdx: null };
    }

    // --- Add item buttons ---
    editorModal.querySelectorAll('.add-item-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var type = btn.dataset.type;
            var newItem = { type: type, content: '' };
            editorIntroduction.push(newItem);
            renderSortableList('editor-introduction-list', editorIntroduction);
            updatePreview();
        });
    });

    // --- Live Preview ---
    ['editor-town-title', 'editor-town-logo', 'editor-town-scale', 'editor-town-type',
     'editor-town-recruit', 'editor-town-x', 'editor-town-y', 'editor-town-z'].forEach(function(id) {
        var el = document.getElementById(id);
        el.addEventListener('input', updatePreview);
        el.addEventListener('change', updatePreview);
    });

    ['editor-town-gradient-from', 'editor-town-gradient-to'].forEach(function(id) {
        var el = document.getElementById(id);
        el.addEventListener('input', updatePreview);
        el.addEventListener('change', updatePreview);
    });

    function updatePreview() {
        var preview = document.getElementById('town-editor-preview-area');
        var title = document.getElementById('editor-town-title').value || '未命名城镇';
        var logo = document.getElementById('editor-town-logo').value.trim();
        var scale = document.getElementById('editor-town-scale').value;
        var townType = document.getElementById('editor-town-type').value;
        var recruit = document.getElementById('editor-town-recruit').value;
        var x = document.getElementById('editor-town-x').value || '0';
        var y = document.getElementById('editor-town-y').value || '64';
        var z = document.getElementById('editor-town-z').value || '0';
        var gradient = {
            from: normalizeHexColor(document.getElementById('editor-town-gradient-from').value, DEFAULT_GRADIENT.from),
            to: normalizeHexColor(document.getElementById('editor-town-gradient-to').value, DEFAULT_GRADIENT.to)
        };
        var hasLogo = logo !== '';

        var html = '<div class="preview-stack">';

        html += '<div class="preview-detail-shell">';
        html += '<div class="town-preview-banner' + (hasLogo ? '' : ' no-logo') + '"' + (hasLogo ? ' style="background-image:url(\'' + escapeHtml(logo) + '\')"' : ' style="' + buildGradientBackgroundStyle(gradient) + '"') + '>';
        if (!hasLogo) {
            html += '<i class="fas fa-city town-banner-placeholder"></i>';
        }
        html += '</div>';
        html += '<div class="preview-detail-header">';
        html += '<h3 class="preview-detail-title">' + escapeHtml(title) + '</h3>';
        html += '<div class="preview-badges">';
        html += '<span class="town-badge badge-scale-' + scale + '"><i class="fas ' + getScaleIcon(scale) + '"></i> ' + getScaleText(scale) + '</span>';
        html += '<span class="town-badge badge-type-' + townType + '"><i class="fas ' + getTownTypeIcon(townType) + '"></i> ' + getTownTypeText(townType) + '</span>';
        html += '<span class="town-badge badge-recruit-' + recruit + '"><i class="fas ' + getRecruitIcon(recruit) + '"></i> ' + getRecruitText(recruit) + '</span>';
        html += '</div>';
        html += '</div>';
        html += '<div class="preview-detail-body">';

        html += '<div class="preview-section">';
        html += '<h4 class="preview-section-title"><i class="fas fa-map-marker-alt"></i> 位置信息</h4>';
        html += '<p class="preview-inline-text">主世界: X: ' + escapeHtml(x) + ', Y: ' + escapeHtml(y) + ', Z: ' + escapeHtml(z) + '</p>';
        html += '</div>';

        html += '<div class="preview-section">';
        html += '<h4 class="preview-section-title"><i class="fas fa-crown"></i> 创始人</h4>';
        if (editorFounders.length > 0) {
            html += '<div class="contributors-list">';
            editorFounders.forEach(function(name) {
                html += '<div class="contributor-tag"><img src="https://minotar.net/avatar/' + encodeURIComponent(name) + '/20" alt="' + escapeHtml(name) + '">' + escapeHtml(name) + '</div>';
            });
            html += '</div>';
        } else {
            html += '<span class="text-secondary">暂无记录</span>';
        }
        html += '</div>';

        html += '<div class="preview-section">';
        html += '<h4 class="preview-section-title"><i class="fas fa-users"></i> 主要成员</h4>';
        if (editorMembers.length > 0) {
            html += '<div class="contributors-list">';
            editorMembers.forEach(function(name) {
                html += '<div class="contributor-tag"><img src="https://minotar.net/avatar/' + encodeURIComponent(name) + '/20" alt="' + escapeHtml(name) + '">' + escapeHtml(name) + '</div>';
            });
            html += '</div>';
        } else {
            html += '<span class="text-secondary">暂无记录</span>';
        }
        html += '</div>';

        html += '<div class="preview-section">';
        html += '<h4 class="preview-section-title"><i class="fas fa-book-open"></i> 城镇介绍</h4>';
        html += '<div class="instruction-content">';
        if (editorIntroduction.length > 0) {
            editorIntroduction.forEach(function(block) {
                if (block.type === 'text') {
                    html += '<p>' + (escapeHtml(block.content) || '<span class="text-secondary">空文字</span>') + '</p>';
                } else if (block.type === 'image') {
                    html += block.content ? '<img src="' + escapeHtml(block.content) + '" loading="lazy">' : '<p class="text-secondary">空图片</p>';
                } else if (block.type === 'video') {
                    html += renderVideoPreviewHtml(block.content);
                }
            });
        } else {
            html += '<p>无</p>';
        }
        html += '</div></div>';

        html += '</div></div>';
        html += '</div>';
        preview.innerHTML = html;
    }

    // --- Save / Generate JSON ---
    document.getElementById('btn-save-town').addEventListener('click', function() {
        var title = document.getElementById('editor-town-title').value.trim();
        if (!title) {
            alert('请填写城镇名称');
            document.getElementById('editor-town-title').focus();
            return;
        }

        var townObj = {
            title: title,
            logo: document.getElementById('editor-town-logo').value.trim(),
            gradient: {
                from: normalizeHexColor(document.getElementById('editor-town-gradient-from').value, DEFAULT_GRADIENT.from),
                to: normalizeHexColor(document.getElementById('editor-town-gradient-to').value, DEFAULT_GRADIENT.to)
            },
            coordinates: {
                x: parseInt(document.getElementById('editor-town-x').value) || 0,
                y: parseInt(document.getElementById('editor-town-y').value) || 64,
                z: parseInt(document.getElementById('editor-town-z').value) || 0
            },
            scale: document.getElementById('editor-town-scale').value,
            townType: document.getElementById('editor-town-type').value,
            recruitment: document.getElementById('editor-town-recruit').value,
            founders: editorFounders.slice(),
            members: editorMembers.slice(),
            introduction: editorIntroduction.filter(function(i) { return i.content.trim() !== ''; }).map(function(i) {
                return i.type === 'video' ? { type: 'video', content: parseBVNumber(i.content) || i.content } : { type: i.type, content: i.content };
            })
        };

        var jsonStr = JSON.stringify(townObj, null, 4);
        document.getElementById('town-json-output').value = jsonStr;
        jsonOutputModal.style.display = 'block';
    });

    // --- Copy JSON ---
    document.getElementById('btn-copy-town-json').addEventListener('click', function() {
        var textArea = document.getElementById('town-json-output');
        textArea.select();
        textArea.setSelectionRange(0, 99999);

        navigator.clipboard.writeText(textArea.value).then(function() {
            var btn = document.getElementById('btn-copy-town-json');
            var originalHTML = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> 已复制！';
            btn.style.background = '#34c759';
            setTimeout(function() {
                btn.innerHTML = originalHTML;
                btn.style.background = '';
            }, 2000);
        }).catch(function() {
            document.execCommand('copy');
            alert('已复制到剪贴板');
        });
    });

    function renderVideoPreviewHtml(content) {
        var bv = parseBVNumber(content);
        if (bv) {
            return '<div class="video-embed-wrapper"><iframe src="https://player.bilibili.com/player.html?bvid=' + bv + '&autoplay=0&high_quality=1" allowfullscreen sandbox="allow-scripts allow-same-origin allow-popups" loading="lazy"></iframe></div>';
        }
        return '<p class="text-secondary">请输入有效的 BV 号或 bilibili 视频地址</p>';
    }

    // --- Utility ---
    function escapeHtml(text) {
        if (!text) return '';
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(text));
        return div.innerHTML;
    }
});
