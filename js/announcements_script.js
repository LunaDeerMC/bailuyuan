document.addEventListener('DOMContentLoaded', () => {
    let announcementsData = [];
    const timeline = document.getElementById('announcements-timeline');
    const noResults = document.getElementById('no-results');
    const categoryFilters = document.getElementById('category-filters');
    const searchInput = document.getElementById('announcement-search');

    let currentFilters = {
        category: 'all',
        search: ''
    };

    let editModeEnabled = false;
    let currentEditItem = null;

    // ========== Secret "edit" keyboard shortcut ==========
    let secretBuffer = '';
    document.addEventListener('keydown', (e) => {
        // Ignore if user is typing in an input/textarea
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
        secretBuffer += e.key.toLowerCase();
        // Keep only last 4 characters
        if (secretBuffer.length > 4) {
            secretBuffer = secretBuffer.slice(-4);
        }
        if (secretBuffer === 'edit') {
            editModeEnabled = !editModeEnabled;
            secretBuffer = '';
            toggleEditButtons(editModeEnabled);
            if (editModeEnabled) {
                console.log('%c[公告管理] 编辑模式已启用', 'color: #34c759; font-weight: bold; font-size: 14px;');
                console.log('%c再次输入 "edit" 可隐藏编辑按钮', 'color: #86868b;');
            } else {
                console.log('%c[公告管理] 编辑模式已隐藏', 'color: #f59e0b; font-weight: bold; font-size: 14px;');
            }
        }
    });

    // Log hint on page load
    console.log('%c[公告管理] 提示：在页面中键入 "edit" 可显示编辑按钮', 'color: #0071e3; font-weight: bold; font-size: 13px;');

    function toggleEditButtons(show) {
        document.querySelectorAll('.edit-hidden').forEach(el => {
            if (show) {
                el.classList.remove('edit-hidden');
                el.classList.add('edit-visible');
            } else {
                el.classList.remove('edit-visible');
                el.classList.add('edit-hidden');
            }
        });
    }

    // ========== Fetch Data ==========
    fetch('data/announcements.json')
        .then(response => response.json())
        .then(data => {
            announcementsData = data;
            // Sort by time descending (newest first)
            announcementsData.sort((a, b) => new Date(b.time) - new Date(a.time));
            renderTimeline();
            handleHashNavigation();
        })
        .catch(err => {
            console.error('Error loading announcements:', err);
            timeline.innerHTML = '<p class="error" style="text-align:center;color:var(--text-secondary);padding:40px;">无法加载公告数据。</p>';
        });

    // ========== Event Listeners ==========
    categoryFilters.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            Array.from(categoryFilters.children).forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            currentFilters.category = e.target.dataset.filter;
            renderTimeline();
        }
    });

    searchInput.addEventListener('input', (e) => {
        currentFilters.search = e.target.value.toLowerCase().trim();
        renderTimeline();
    });

    // ========== Render ==========
    function renderTimeline() {
        timeline.innerHTML = '';

        const filtered = announcementsData.filter(item => {
            const matchCategory = currentFilters.category === 'all' || item.category === currentFilters.category;
            const matchSearch = !currentFilters.search ||
                item.title.toLowerCase().includes(currentFilters.search) ||
                item.intro.toLowerCase().includes(currentFilters.search);
            return matchCategory && matchSearch;
        });

        if (filtered.length === 0) {
            noResults.classList.remove('is-hidden');
            return;
        } else {
            noResults.classList.add('is-hidden');
        }

        filtered.forEach((item, index) => {
            const anchorId = generateAnchorId(item);
            const timelineItem = document.createElement('div');
            timelineItem.className = 'timeline-item category-' + item.category;
            timelineItem.id = anchorId;

            const card = document.createElement('div');
            card.className = 'announcement-card';
            // Expand the first (newest) item by default
            if (index === 0) {
                card.classList.add('expanded');
            }

            const categoryBadgeClass = getCategoryBadgeClass(item.category);
            const categoryText = getCategoryText(item.category);
            const categoryIcon = getCategoryIcon(item.category);

            // Summary
            const summary = document.createElement('div');
            summary.className = 'card-summary';
            summary.innerHTML = `
                <div class="card-summary-main">
                    <div class="card-summary-top">
                        <span class="category-badge ${categoryBadgeClass}">
                            <i class="fas ${categoryIcon}"></i> ${categoryText}
                        </span>
                        <h3 class="announcement-title">${escapeHtml(item.title)}</h3>
                    </div>
                    <p class="announcement-intro">${escapeHtml(item.intro)}</p>
                </div>
                <span class="card-summary-time"><i class="far fa-clock"></i> ${escapeHtml(item.time)}</span>
                <i class="fas fa-chevron-down expand-icon"></i>
            `;

            summary.addEventListener('click', () => {
                const wasExpanded = card.classList.contains('expanded');
                // Collapse all
                timeline.querySelectorAll('.announcement-card.expanded').forEach(c => c.classList.remove('expanded'));
                // Toggle current
                if (!wasExpanded) {
                    card.classList.add('expanded');
                }
            });

            // Detail
            const detail = document.createElement('div');
            detail.className = 'card-detail';
            const detailInner = document.createElement('div');
            detailInner.className = 'detail-content';
            renderContentBlocks(detailInner, item.content);

            // Action buttons row inside detail
            const actionRow = document.createElement('div');
            actionRow.className = 'detail-action-btn-row';

            // Share button
            const shareBtn = document.createElement('button');
            shareBtn.className = 'btn-share-announcement';
            shareBtn.innerHTML = '<i class="fas fa-share-alt"></i> 分享';
            shareBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                var url = location.origin + location.pathname + '#' + anchorId;
                navigator.clipboard.writeText(url).then(() => {
                    shareBtn.innerHTML = '<i class="fas fa-check"></i> 已复制链接';
                    shareBtn.classList.add('shared');
                    setTimeout(() => {
                        shareBtn.innerHTML = '<i class="fas fa-share-alt"></i> 分享';
                        shareBtn.classList.remove('shared');
                    }, 2000);
                }).catch(() => {
                    // Fallback: use a temporary input
                    var tmp = document.createElement('input');
                    tmp.value = url;
                    document.body.appendChild(tmp);
                    tmp.select();
                    document.execCommand('copy');
                    document.body.removeChild(tmp);
                    shareBtn.innerHTML = '<i class="fas fa-check"></i> 已复制链接';
                    setTimeout(() => {
                        shareBtn.innerHTML = '<i class="fas fa-share-alt"></i> 分享';
                    }, 2000);
                });
            });
            actionRow.appendChild(shareBtn);

            // Edit button (hidden by default)
            const editBtn = document.createElement('button');
            editBtn.className = 'btn-edit-announcement ' + (editModeEnabled ? 'edit-visible' : 'edit-hidden');
            editBtn.innerHTML = '<i class="fas fa-pen"></i> 编辑';
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openEditor(item);
            });
            actionRow.appendChild(editBtn);

            detail.appendChild(detailInner);
            detail.appendChild(actionRow);

            card.appendChild(summary);
            card.appendChild(detail);
            timelineItem.appendChild(card);
            timeline.appendChild(timelineItem);
        });
    }

    function renderContentBlocks(container, blocks) {
        container.innerHTML = '';
        if (!blocks || blocks.length === 0) {
            container.innerHTML = '<p style="color:var(--text-secondary);">暂无内容</p>';
            return;
        }
        blocks.forEach(block => {
            if (block.type === 'text') {
                const p = document.createElement('p');
                p.innerText = block.content;
                container.appendChild(p);
            } else if (block.type === 'image') {
                const img = document.createElement('img');
                img.src = block.content;
                img.loading = 'lazy';
                container.appendChild(img);
            } else if (block.type === 'video') {
                const bv = parseBVNumber(block.content);
                if (bv) {
                    const wrapper = document.createElement('div');
                    wrapper.className = 'video-embed-wrapper';
                    const iframe = document.createElement('iframe');
                    iframe.src = 'https://player.bilibili.com/player.html?bvid=' + bv + '&autoplay=0&high_quality=1';
                    iframe.allowFullscreen = true;
                    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups');
                    iframe.loading = 'lazy';
                    wrapper.appendChild(iframe);
                    container.appendChild(wrapper);
                } else {
                    const p = document.createElement('p');
                    p.className = 'text-secondary';
                    p.innerText = '无效的视频 BV 号';
                    container.appendChild(p);
                }
            }
        });
    }

    // ========== Generate stable ID for announcement ==========
    function generateAnchorId(item) {
        // Use title + time to create a stable hash-friendly ID
        var raw = (item.time || '') + '_' + (item.title || '');
        var hash = 0;
        for (var i = 0; i < raw.length; i++) {
            hash = ((hash << 5) - hash) + raw.charCodeAt(i);
            hash |= 0;
        }
        return 'a' + Math.abs(hash).toString(36);
    }

    // ========== Handle URL hash on load ==========
    function handleHashNavigation() {
        var hash = location.hash.replace('#', '');
        if (!hash) return;
        var target = document.getElementById(hash);
        if (!target) return;
        // Expand this card
        var card = target.querySelector('.announcement-card');
        if (card) {
            timeline.querySelectorAll('.announcement-card.expanded').forEach(function(c) { c.classList.remove('expanded'); });
            card.classList.add('expanded');
        }
        // Scroll into view with a small delay for layout
        setTimeout(function() {
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    }

    // ========== Helpers ==========
    function getCategoryText(cat) {
        const map = { 'activity': '活动', 'maintenance': '维护', 'other': '其他' };
        return map[cat] || cat;
    }

    function getCategoryIcon(cat) {
        const map = { 'activity': 'fa-calendar-check', 'maintenance': 'fa-wrench', 'other': 'fa-info-circle' };
        return map[cat] || 'fa-info-circle';
    }

    function getCategoryBadgeClass(cat) {
        const map = { 'activity': 'badge-activity', 'maintenance': 'badge-maintenance', 'other': 'badge-other' };
        return map[cat] || 'badge-other';
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

    function escapeHtml(text) {
        if (!text) return '';
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(text));
        return div.innerHTML;
    }

    // ========== Editor Modal ==========
    const editorModal = document.getElementById('editor-modal');
    const jsonOutputModal = document.getElementById('json-output-modal');
    const closeEditorModal = document.querySelector('.close-editor-modal');
    const closeJsonModal = document.querySelector('.close-json-modal');

    document.getElementById('btn-add-announcement').addEventListener('click', () => {
        openEditor(null);
    });

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

    let editorContentBlocks = [];

    // Custom select init
    document.querySelectorAll('.custom-select').forEach(select => {
        const trigger = select.querySelector('.custom-select-trigger');
        const options = select.querySelectorAll('.custom-option');
        const input = select.querySelector('input[type="hidden"]');
        const text = select.querySelector('.custom-select-text');

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = select.classList.contains('open');
            document.querySelectorAll('.custom-select').forEach(s => s.classList.remove('open'));
            if (!isOpen) {
                select.classList.add('open');
            }
        });

        options.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                options.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                text.innerText = option.innerText;
                input.value = option.dataset.value;
                input.dispatchEvent(new Event('change'));
                select.classList.remove('open');
            });
        });
    });

    document.addEventListener('click', () => {
        document.querySelectorAll('.custom-select').forEach(s => s.classList.remove('open'));
    });

    function setCustomSelectValue(id, value) {
        var input = document.getElementById(id);
        if (!input) return;
        var select = input.closest('.custom-select');
        var option = select.querySelector('.custom-option[data-value="' + value + '"]');
        if (option) {
            input.value = value;
            select.querySelector('.custom-select-text').innerText = option.innerText;
            select.querySelectorAll('.custom-option').forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
        }
    }

    function openEditor(item) {
        currentEditItem = item;
        editorContentBlocks = item ? item.content.map(c => ({...c})) : [];

        document.getElementById('editor-title').value = item ? item.title : '';
        document.getElementById('editor-intro').value = item ? item.intro : '';
        document.getElementById('editor-time').value = item ? item.time : new Date().toISOString().slice(0, 10);
        setCustomSelectValue('editor-category', item ? item.category : 'activity');

        renderSortableList('editor-content-list', editorContentBlocks);
        updatePreview();

        editorModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    // ========== Sortable List (drag-and-drop) ==========
    let dragState = { listId: null, fromIdx: null };

    function renderSortableList(listId, items) {
        var container = document.getElementById(listId);
        container.innerHTML = '';
        items.forEach((item, idx) => {
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
            contentEl.addEventListener('input', () => {
                items[idx].content = contentEl.value;
                updatePreview();
            });

            div.querySelector('.remove-item-btn').addEventListener('click', () => {
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
    function onDragOver(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }
    function onDragEnter(e) {
        var item = e.target.closest('.sortable-item');
        if (item && item.dataset.listId === dragState.listId) item.classList.add('drag-over');
    }
    function onDragLeave(e) {
        var item = e.target.closest('.sortable-item');
        if (item) item.classList.remove('drag-over');
    }
    function onDrop(e) {
        e.preventDefault();
        var item = e.target.closest('.sortable-item');
        if (!item || item.dataset.listId !== dragState.listId) return;
        var toIdx = parseInt(item.dataset.idx);
        var fromIdx = dragState.fromIdx;
        if (fromIdx === toIdx) return;
        var moved = editorContentBlocks.splice(fromIdx, 1)[0];
        editorContentBlocks.splice(toIdx, 0, moved);
        renderSortableList('editor-content-list', editorContentBlocks);
        updatePreview();
    }
    function onDragEnd() {
        document.querySelectorAll('.sortable-item').forEach(el => el.classList.remove('dragging', 'drag-over'));
        dragState = { listId: null, fromIdx: null };
    }

    // Add content buttons
    document.querySelectorAll('.add-item-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            var type = btn.dataset.type;
            editorContentBlocks.push({ type: type, content: '' });
            renderSortableList('editor-content-list', editorContentBlocks);
            updatePreview();
        });
    });

    // Live Preview
    ['editor-title', 'editor-intro', 'editor-time', 'editor-category'].forEach(id => {
        document.getElementById(id).addEventListener('input', updatePreview);
        document.getElementById(id).addEventListener('change', updatePreview);
    });

    function updatePreview() {
        var preview = document.getElementById('editor-preview-area');
        var title = document.getElementById('editor-title').value || '未命名公告';
        var intro = document.getElementById('editor-intro').value || '暂无简介';
        var time = document.getElementById('editor-time').value || '未设定';
        var category = document.getElementById('editor-category').value;

        var categoryText = getCategoryText(category);
        var categoryIcon = getCategoryIcon(category);
        var badgeClass = getCategoryBadgeClass(category);

        var html = '<div class="preview-announcement">';
        html += '<div class="preview-header">';
        html += '<div class="preview-title">' + escapeHtml(title) + '</div>';
        html += '<div class="preview-meta">';
        html += '<span class="category-badge ' + badgeClass + '"><i class="fas ' + categoryIcon + '"></i> ' + categoryText + '</span>';
        html += '<span class="card-summary-time"><i class="far fa-clock"></i> ' + escapeHtml(time) + '</span>';
        html += '</div>';
        html += '</div>';

        html += '<div class="preview-body">';
        html += '<p class="preview-intro-text">' + escapeHtml(intro) + '</p>';
        html += '<div class="detail-content">';
        if (editorContentBlocks.length > 0) {
            editorContentBlocks.forEach(block => {
                if (block.type === 'text') {
                    html += '<p>' + (escapeHtml(block.content) || '<span class="text-secondary">空文字</span>') + '</p>';
                } else if (block.type === 'image') {
                    html += block.content ? '<img src="' + escapeHtml(block.content) + '" loading="lazy">' : '<p class="text-secondary">空图片</p>';
                } else if (block.type === 'video') {
                    html += renderVideoPreviewHtml(block.content);
                }
            });
        } else {
            html += '<p class="text-secondary">暂无正文内容</p>';
        }
        html += '</div></div></div>';
        preview.innerHTML = html;
    }

    function renderVideoPreviewHtml(content) {
        var bv = parseBVNumber(content);
        if (bv) {
            return '<div class="video-embed-wrapper"><iframe src="https://player.bilibili.com/player.html?bvid=' + bv + '&autoplay=0&high_quality=1" allowfullscreen sandbox="allow-scripts allow-same-origin allow-popups" loading="lazy"></iframe></div>';
        }
        return '<p class="text-secondary">请输入有效的 BV 号或 bilibili 视频地址</p>';
    }

    // ========== Save / Generate JSON ==========
    document.getElementById('btn-save-announcement').addEventListener('click', () => {
        var title = document.getElementById('editor-title').value.trim();
        if (!title) {
            alert('请填写公告标题');
            document.getElementById('editor-title').focus();
            return;
        }

        var announcementObj = {
            title: title,
            intro: document.getElementById('editor-intro').value.trim(),
            time: document.getElementById('editor-time').value,
            category: document.getElementById('editor-category').value,
            content: editorContentBlocks.filter(i => i.content.trim() !== '').map(i => {
                if (i.type === 'video') {
                    return { type: 'video', content: parseBVNumber(i.content) || i.content };
                }
                return { ...i };
            })
        };

        var jsonStr = JSON.stringify(announcementObj, null, 4);
        document.getElementById('json-output').value = jsonStr;
        jsonOutputModal.style.display = 'block';
    });

    // Copy JSON
    document.getElementById('btn-copy-json').addEventListener('click', () => {
        var textArea = document.getElementById('json-output');
        textArea.select();
        textArea.setSelectionRange(0, 99999);

        navigator.clipboard.writeText(textArea.value).then(() => {
            var btn = document.getElementById('btn-copy-json');
            var originalHTML = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> 已复制！';
            btn.style.background = '#34c759';
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.background = '';
            }, 2000);
        }).catch(() => {
            document.execCommand('copy');
            alert('已复制到剪贴板');
        });
    });
});
