class InspectorToolbar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.isExpanded = false;
    this.isInspecting = false;
    this.selectedElements = new Map();
    this.colorIndex = 0;
    this.colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
      '#FF9FF3', '#54A0FF', '#48DBFB', '#1DD1A1', '#FFC048'
    ];
    this.badges = new Map();
    this.aiEndpoint = '';

    this.render();
    this.attachEventListeners();
  }

  static get observedAttributes() {
    return ['ai-endpoint'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'ai-endpoint' && oldValue !== newValue) {
      this.aiEndpoint = newValue;
    }
  }

  get aiEndpoint() {
    return this.getAttribute('ai-endpoint') || '';
  }

  set aiEndpoint(value) {
    if (value) {
      this.setAttribute('ai-endpoint', value);
    } else {
      this.removeAttribute('ai-endpoint');
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 999999;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .toolbar-button {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #2563eb;
          border: none;
          color: white;
          cursor: pointer;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          position: relative;
          z-index: 1000000;
        }

        .toolbar-button:hover {
          background: #1d4ed8;
          transform: scale(1.05);
        }
        
        .toolbar-button.active {
          background: #1d4ed8;
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
        }

        .toolbar-card {
          cursor: auto !important;
          position: absolute;
          bottom: 60px;
          right: 0;
          background: white;
          border-radius: 10px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
          padding: 12px;
          display: none;
          min-width: 380px;
          transform: translateY(20px);
          opacity: 0;
          transition: transform 0.3s ease, opacity 0.3s ease;
          z-index: 1;
        }

        .toolbar-card.expanded {
          display: block;
          transform: translateY(0);
          opacity: 1;
        }

        .toolbar-header {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
          width: 100%;
        }

        .toolbar-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .toolbar-input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 13px;
          transition: border-color 0.2s ease;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          width: 100%;
        }
        
        .toolbar-input:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
        }
    
        .action-button {
          padding: 6px 10px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          height: 30px;
        }

        .inspect-button {
          background: #2563eb;
          color: white;
        }

        .inspect-button:hover {
          background: #1d4ed8;
          transform: translateY(-1px);
          box-shadow: 0 3px 6px rgba(37, 99, 235, 0.25);
        }
        
        .inspect-button:active {
          transform: translateY(0);
          background: #1e40af;
        }

        .close-button {
          background: #ef4444;
          color: white;
          display: none;
        }

        .close-button:hover {
          background: #dc2626;
          transform: translateY(-1px);
          box-shadow: 0 3px 6px rgba(239, 68, 68, 0.25);
        }
        
        .close-button:active {
          transform: translateY(0);
          background: #b91c1c;
        }

        .clear-button {
          background: #6b7280;
          color: white;
        }

        .clear-button:hover {
          background: #4b5563;
          transform: translateY(-1px);
          box-shadow: 0 3px 6px rgba(107, 114, 128, 0.25);
        }
        
        .clear-button:active {
          transform: translateY(0);
          background: #374151;
        }

        .new-chat-button {
          background: #10b981;
          color: white;
        }

        .new-chat-button:hover {
          background: #059669;
          transform: translateY(-1px);
          box-shadow: 0 3px 6px rgba(16, 185, 129, 0.25);
        }
        
        .new-chat-button:active {
          transform: translateY(0);
          background: #047857;
        }

        .inspecting .close-button {
          display: inline-flex;
        }

        .inspecting .inspect-button {
          display: none;
        }

        .icon {
          width: 20px;
          height: 20px;
        }

        /* Loading overlay styles */
        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.9);
          display: none;
          align-items: center;
          justify-content: center;
          z-index: 10;
          border-radius: 10px;
          backdrop-filter: blur(2px);
        }

        .loading-overlay.show {
          display: flex;
        }

        .loading-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .loading-text {
          color: #374151;
          font-size: 11px;
          font-weight: 500;
        }
      </style>

      <div class="toolbar-button" id="toggleButton">
        <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
          <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
        </svg>
      </div>

      <div class="toolbar-card" id="toolbarCard">
        <div class="toolbar-header">
          <input autocomplete="off" type="text" class="toolbar-input" id="promptInput" placeholder="Enter your prompt..." />
        </div>
        
        <div class="toolbar-actions">
          <button class="action-button new-chat-button" id="newChatButton">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>New Chat</span>
          </button>
          <button class="action-button inspect-button" id="inspectButton">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4C14.0683 4 16.0293 4.71758 17.6417 6.04606C19.2542 7.37454 20.44 9.25979 21 11.4C20.44 13.5402 19.2542 15.4255 17.6417 16.7539C16.0293 18.0824 14.0683 18.8 12 18.8C9.93174 18.8 7.97070 18.0824 6.35825 16.7539C4.7458 15.4255 3.56 13.5402 3 11.4C3.56 9.25979 4.7458 7.37454 6.35825 6.04606C7.97070 4.71758 9.93174 4 12 4ZM12 17C13.5913 17 15.1174 16.3679 16.2426 15.2426C17.3679 14.1174 18 12.5913 18 11C18 9.4087 17.3679 7.88258 16.2426 6.75736C15.1174 5.63214 13.5913 5 12 5C10.4087 5 8.88258 5.63214 7.75736 6.75736C6.63214 7.88258 6 9.4087 6 11C6 12.5913 6.63214 14.1174 7.75736 15.2426C8.88258 16.3679 10.4087 17 12 17ZM12 15C11.0717 15 10.1815 14.6313 9.52513 13.9749C8.86875 13.3185 8.5 12.4283 8.5 11.5C8.5 10.5717 8.86875 9.6815 9.52513 9.02513C10.1815 8.36875 11.0717 8 12 8C12.9283 8 13.8185 8.36875 14.4749 9.02513C15.1313 9.6815 15.5 10.5717 15.5 11.5C15.5 12.4283 15.1313 13.3185 14.4749 13.9749C13.8185 14.6313 12.9283 15 12 15Z" fill="currentColor"/>
            </svg>
            <span>Inspect</span>
          </button>
          <button class="action-button close-button" id="closeInspectButton">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Cancel</span>
          </button>
          <button class="action-button clear-button" id="clearSelectionsButton" style="display: none;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Clear</span>
          </button>
        </div>
        
        <!-- Loading overlay -->
        <div class="loading-overlay" id="loadingOverlay">
          <div class="loading-content">
            <div class="loading-text">Making request, pls check in the Cursor</div>
          </div>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    const toggleButton = this.shadowRoot.getElementById('toggleButton');
    const toolbarCard = this.shadowRoot.getElementById('toolbarCard');
    const inspectButton = this.shadowRoot.getElementById('inspectButton');
    const closeInspectButton = this.shadowRoot.getElementById('closeInspectButton');
    const clearSelectionsButton = this.shadowRoot.getElementById('clearSelectionsButton');
    const promptInput = this.shadowRoot.getElementById('promptInput');
    const newChatButton = this.shadowRoot.getElementById('newChatButton');

    // Toggle expand/collapse
    toggleButton.addEventListener('click', () => {
      this.isExpanded = !this.isExpanded;
      if (this.isExpanded) {
        toolbarCard.classList.add('expanded');
        toggleButton.classList.add('active');

        // Automatically enter inspection mode if no elements are selected
        if (this.selectedElements.size === 0 && !this.isInspecting) {
          this.enterInspectionMode();
        }
      } else {
        toolbarCard.classList.remove('expanded');
        toggleButton.classList.remove('active');
        if (this.isInspecting) {
          this.exitInspectionMode();
        }
      }
    });

    // Click outside to collapse
    document.addEventListener('click', (e) => {
      if (!this.contains(e.target) && this.isExpanded && !this.isInspecting) {
        this.isExpanded = false;
        toolbarCard.classList.remove('expanded');
      }
    });

    // Start inspection mode
    inspectButton.addEventListener('click', () => {
      this.enterInspectionMode();
    });

    // Exit inspection mode
    closeInspectButton.addEventListener('click', () => {
      this.exitInspectionMode();
    });

    // Clear selections button
    clearSelectionsButton.addEventListener('click', () => {
      this.clearAllSelections();
    });

    // New chat button
    newChatButton.addEventListener('click', () => {
      // Clear the input field
      promptInput.value = '';
      
      // Clear all selections
      this.clearAllSelections();
      
      this.enterInspectionMode();

      // Send new chat request
      fetch(`${this.aiEndpoint}/newChat`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
    });

    // Handle prompt input
    promptInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.handlePromptSubmit(promptInput.value.trim());
      }
    });
  }

  enterInspectionMode() {
    if (this.isInspecting) {
      return;
    }

    this.isInspecting = true;
    this.shadowRoot.querySelector('.toolbar-card').classList.add('inspecting');

    // Add global styles for crosshair cursor
    this.addInspectionStyles();

    // Add global event listeners với capture: true để bắt event trước khi đến target
    document.addEventListener('mouseover', this.handleMouseOver, true);
    document.addEventListener('mouseout', this.handleMouseOut, true);
    document.addEventListener('click', this.handleElementClick, true);

    // Thêm event listeners để ngăn chặn tất cả mouse events khác
    document.addEventListener('mousedown', this.preventMouseEvents, true);
    document.addEventListener('mouseup', this.preventMouseEvents, true);
    document.addEventListener('dblclick', this.preventMouseEvents, true);
    document.addEventListener('contextmenu', this.preventMouseEvents, true);
  }

  exitInspectionMode() {
    if (!this.isInspecting) {
      return;
    }

    this.isInspecting = false;
    this.shadowRoot.querySelector('.toolbar-card').classList.remove('inspecting');

    // Remove global inspection styles
    this.removeInspectionStyles();

    // Remove global event listeners
    document.removeEventListener('mouseover', this.handleMouseOver, true);
    document.removeEventListener('mouseout', this.handleMouseOut, true);
    document.removeEventListener('click', this.handleElementClick, true);

    // Remove additional mouse event preventers
    document.removeEventListener('mousedown', this.preventMouseEvents, true);
    document.removeEventListener('mouseup', this.preventMouseEvents, true);
    document.removeEventListener('dblclick', this.preventMouseEvents, true);
    document.removeEventListener('contextmenu', this.preventMouseEvents, true);

    // Remove hover highlight
    this.removeHoverHighlight();
  }

  addInspectionStyles() {
    // Create style element for inspection mode
    this.inspectionStyleElement = document.createElement('style');
    this.inspectionStyleElement.id = 'inspector-toolbar-styles';
    this.inspectionStyleElement.textContent = `
      * {
        cursor: crosshair !important;
      }
    `;
    document.head.appendChild(this.inspectionStyleElement);
  }

  removeInspectionStyles() {
    if (this.inspectionStyleElement) {
      this.inspectionStyleElement.remove();
      this.inspectionStyleElement = null;
    }
  }

  handleMouseOver = (e) => {
    if (e.target === this || this.contains(e.target)) return;

    this.removeHoverHighlight();

    // Don't highlight already selected elements
    if (!this.selectedElements.has(e.target)) {
      e.target.style.outline = '2px solid #3B82F6';
      e.target.style.outlineOffset = '2px';
      this.currentHoveredElement = e.target;
    }
  }

  handleMouseOut = (e) => {
    if (e.target === this || this.contains(e.target)) return;

    // Only remove hover highlight if element is not selected
    if (!this.selectedElements.has(e.target)) {
      e.target.style.outline = '';
      e.target.style.outlineOffset = '';
    }
  }

  handleElementClick = (e) => {
    if (e.target === this || this.contains(e.target)) return;

    // Ngăn chặn hoàn toàn event propagation và default behavior
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation(); // Thêm dòng này để ngăn chặn tất cả event listeners khác

    if (this.selectedElements.has(e.target)) {
      // Deselect element
      this.deselectElement(e.target);
    } else {
      // Select element
      this.selectElement(e.target);
    }
  }

  selectElement(element) {
    const color = this.colors[this.colorIndex % this.colors.length];
    const index = this.selectedElements.size + 1;
    this.colorIndex++;

    element.style.outline = `3px solid ${color}`;
    element.style.outlineOffset = '2px';

    // Create badge
    const badge = this.createBadge(index, color, element);
    this.badges.set(element, badge);

    this.selectedElements.set(element, {
      color: color,
      originalOutline: element.style.outline,
      originalOutlineOffset: element.style.outlineOffset,
      index: index
    });

    // Show clear button if we have selections
    this.updateClearButtonVisibility();
  }

  deselectElement(element) {
    const elementData = this.selectedElements.get(element);
    if (elementData) {
      element.style.outline = '';
      element.style.outlineOffset = '';

      // Remove badge
      const badge = this.badges.get(element);
      if (badge) {
        badge.remove();
        this.badges.delete(element);
      }

      this.selectedElements.delete(element);

      // Reindex remaining elements
      this.reindexElements();

      // Update clear button visibility
      this.updateClearButtonVisibility();
    }
  }

  clearAllSelections() {
    this.selectedElements.forEach((data, element) => {
      element.style.outline = '';
      element.style.outlineOffset = '';
    });

    // Remove all badges
    this.badges.forEach(badge => badge.remove());
    this.badges.clear();

    this.selectedElements.clear();
    this.colorIndex = 0;

    // Hide clear button
    this.updateClearButtonVisibility();
  }

  removeHoverHighlight() {
    if (this.currentHoveredElement && !this.selectedElements.has(this.currentHoveredElement)) {
      this.currentHoveredElement.style.outline = '';
      this.currentHoveredElement.style.outlineOffset = '';
      this.currentHoveredElement = null;
    }
  }

  createBadge(index, color, element) {
    const badge = document.createElement('div');
    badge.style.cssText = `
      position: absolute;
      top: -10px;
      left: -10px;
      width: 20px;
      height: 20px;
      background-color: ${color};
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: bold;
      z-index: 999998;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      pointer-events: none;
    `;
    badge.textContent = index;

    // Position badge relative to element
    const rect = element.getBoundingClientRect();
    badge.style.position = 'fixed';
    badge.style.top = `${rect.top - 10}px`;
    badge.style.left = `${rect.left - 10}px`;

    document.body.appendChild(badge);

    // Update badge position on scroll/resize
    const updatePosition = () => {
      const rect = element.getBoundingClientRect();
      badge.style.top = `${rect.top - 10}px`;
      badge.style.left = `${rect.left - 10}px`;
    };

    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    // Store cleanup function
    badge._cleanup = () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };

    return badge;
  }

  reindexElements() {
    let index = 1;
    const newBadges = new Map();

    this.selectedElements.forEach((data, element) => {
      data.index = index;

      // Update badge
      const oldBadge = this.badges.get(element);
      if (oldBadge) {
        oldBadge.textContent = index;
      }

      index++;
    });
  }

  updateClearButtonVisibility() {
    const clearButton = this.shadowRoot.getElementById('clearSelectionsButton');
    if (this.selectedElements.size > 0) {
      clearButton.style.display = 'inline-flex';
    } else {
      clearButton.style.display = 'none';
    }
  }

  // Thêm method mới để ngăn chặn mouse events
  preventMouseEvents = (e) => {
    if (e.target === this || this.contains(e.target)) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  }

  // Helper method để tìm parent của element trong selected elements
  findSelectedParent(element) {
    let currentElement = element.parentElement;

    while (currentElement && currentElement !== document.body) {
      if (this.selectedElements.has(currentElement)) {
        return currentElement;
      }
      currentElement = currentElement.parentElement;
    }

    return null;
  }

  // Helper method để tìm children của element trong selected elements
  findSelectedChildren(element) {
    const children = [];

    this.selectedElements.forEach((data, selectedElement) => {
      if (element.contains(selectedElement) && selectedElement !== element) {
        children.push(selectedElement);
      }
    });

    return children;
  }

  // Helper method để tính level của element
  calculateElementLevel(element) {
    let level = 0;
    let parent = this.findSelectedParent(element);

    while (parent) {
      level++;
      parent = this.findSelectedParent(parent);
    }

    return level;
  }

  handlePromptSubmit(prompt) {
    if (!prompt) {
      console.log('Empty prompt, nothing to process');
      return;
    }

    console.log('AI Prompt submitted:', prompt);
    console.log('Selected elements:', Array.from(this.selectedElements.keys()));

    // Get current page information first
    const pageInfo = this.getCurrentPageInfo();

    // Build hierarchical structure dynamically
    const buildHierarchicalStructure = () => {
      const rootElements = [];

      // Find root elements (no selected parent)
      this.selectedElements.forEach((data, element) => {
        if (!this.findSelectedParent(element)) {
          rootElements.push(element);
        }
      });

      // Recursive function to build tree structure
      const buildElementInfo = (element) => {
        const data = this.selectedElements.get(element);
        const children = this.findSelectedChildren(element);
        
        // Get Vue component information if available
        let vueComponent = null;
        if (pageInfo.vue && pageInfo.vue.isDevMode) {
          vueComponent = this.findNearestComponent(element);
        }

        const elementInfo = {
          index: data.index,
          tagName: element.tagName,
          level: this.calculateElementLevel(element),
          textContent: element.textContent?.substring(0, 100) || '',
          attributes: Array.from(element.attributes).reduce((acc, attr) => {
            acc[attr.name] = attr.value;
            return acc;
          }, {}),
          children: []
        };
        
        // Add Vue component info directly to the element if available
        if (vueComponent) {
          elementInfo.vueComponent = vueComponent;
        }

        // Add direct children only (not all descendants)
        const directChildren = children.filter(child =>
          this.findSelectedParent(child) === element
        );

        directChildren.forEach(child => {
          elementInfo.children.push(buildElementInfo(child));
        });

        return elementInfo;
      };

      return rootElements.map(element => buildElementInfo(element));
    };

    const selectedElementsHierarchy = buildHierarchicalStructure();

    // Call the AI with the prompt, structured element data, and page info
    if (this.aiEndpoint) {
      this.callAI(prompt, selectedElementsHierarchy, pageInfo);
    } else {
      console.warn('No AI endpoint provided. Set the ai-endpoint attribute to use AI features.');
    }

    // Clear the input after submission
    const promptInput = this.shadowRoot.getElementById('promptInput');
    promptInput.value = '';
  }

  // New method to get current page information
  getCurrentPageInfo() {
    const pageInfo = {
      url: window.location.href,
      title: document.title,
    };

    // Detect Vue and its development mode
    pageInfo.vue = this.detectVue();

    return pageInfo;
  }

  // Detect Vue and check if it's in development mode
  detectVue() {
    const vueInfo = {
      detected: false,
      isDevMode: false,
      hasDevTools: false
    };

    try {
      // Check for Vue DevTools Kit (Vue 3)
      if (window.__VUE_DEVTOOLS_KIT_APP_RECORDS__) {
        vueInfo.detected = true;
        vueInfo.isDevMode = true;
        vueInfo.hasDevTools = true;
      }
      // Check for standard Vue 3
      else if (window.__VUE__) {
        vueInfo.detected = true;
        vueInfo.isDevMode = true;
      }
    } catch (e) {
      console.error('Error detecting Vue:', e);
    }

    return vueInfo;
  }

  // Get Vue component information for selected elements
  getVueComponentsInfo() {
    const componentsInfo = [];

    try {
      this.selectedElements.forEach((data, element) => {
        const vueInfo = this.findNearestComponent(element);
        if (vueInfo) {
          componentsInfo.push({
            elementIndex: data.index,
            ...vueInfo
          });
        }
      });
    } catch (e) {
      console.error('Error getting Vue component info:', e);
    }

    return componentsInfo;
  }

  // Find nearest Vue component by recursively traversing up the DOM tree
  findNearestComponent(element) {
    if (!element) return null;
    
    // Stop if we reach the document body
    if (element === document.body) {
      console.log('Reached document body without finding a component');
      return null;
    }
    
    try {
      // Check current element
      const componentInfo = this.getVueComponentInfo(element);
      
      // If we found a component and it's not Primitive, return it
      if (componentInfo) {
        if (componentInfo.name !== 'Primitive') {
          console.log('Found Vue component:', componentInfo.name);
          return componentInfo;
        } else {
          console.log('Found Primitive component, continuing up the tree');
        }
      }
      
      // Continue up the tree if we didn't find a component or found a Primitive
      return this.findNearestComponent(element.parentElement);
    } catch (e) {
      console.error('Error finding nearest component:', e);
      return null;
    }
  }
  
  // Get Vue component information for a DOM element
  getVueComponentInfo(element) {
    if (!element) return null;
    
    try {
      // Fallback: Try Vue 3 __vnode property
      if (element.__vueParentComponent || element._vnode) {
        const instance = element.__vueParentComponent || element._vnode?.component?.proxy;
        if (instance) {
          return this.extractComponentInfo(instance);
        }
      }
    } catch (e) {
      console.error('Error getting Vue component info:', e);
    }
    
    return null;
  }
  // Helper method to extract component information
  extractComponentInfo(instance) {
    try {
      // Get component name from various possible locations
      let componentName = 'Anonymous';
      if (instance?.$options?.name) {
        componentName = instance.$options.name;
      } else if (instance?.type?.name) {
        componentName = instance.type.name;
      } else if (instance?.$?.type?.name) {
        componentName = instance.$.type.name;
      } else if (instance?.$?.vnode?.type?.name) {
        componentName = instance.$.vnode.type.name;
      }
      
      // Create the base component info object
      const componentInfo = {
        name: componentName,
        filename: instance.$options?.__file || instance.type?.__file || null
      };
    
      
      // Log component info for debugging
      console.log('Extracted component info:', componentInfo);

      return componentInfo;
    } catch (e) {
      console.error('Error extracting component info:', e);
      return null;
    }
  }

  formatPrompt(userPrompt, selectedElements, pageInfo) {
    // Build the formatted prompt with page info and structured tags
    let formattedPrompt = `<userRequest>${userPrompt}</userRequest>\n\n`;
    
    // Add page information
    if (pageInfo) {
      formattedPrompt += `<pageInfo>\n`;
      formattedPrompt += `  <url>${this.escapeXml(pageInfo.url)}</url>\n`;
      formattedPrompt += `  <title>${this.escapeXml(pageInfo.title)}</title>\n`;
      
      // Add Vue detection information
      if (pageInfo.vue && pageInfo.vue.detected) {
        formattedPrompt += `  <vue>\n`;
        formattedPrompt += `    <detected>${pageInfo.vue.detected}</detected>\n`;
        formattedPrompt += `    <isDevMode>${pageInfo.vue.isDevMode}</isDevMode>\n`;
        formattedPrompt += `  </vue>\n`;
      }
      
      formattedPrompt += `</pageInfo>\n\n`;
    }
    
    if (selectedElements && selectedElements.length > 0) {
      formattedPrompt += `<selectedElements>\n`;
      
      // Recursive function to format element hierarchy
      const formatElement = (element, depth = 0) => {
        const indent = '  '.repeat(depth);
        let elementStr = `${indent}<element index="${element.index}" level="${element.level}">\n`;
        elementStr += `${indent}  <tagName>${element.tagName}</tagName>\n`;
        
        // Add attributes if they exist
        if (Object.keys(element.attributes).length > 0) {
          elementStr += `${indent}  <attributes>\n`;
          Object.entries(element.attributes).forEach(([key, value]) => {
            elementStr += `${indent}    <${key}>${this.escapeXml(value)}</${key}>\n`;
          });
          elementStr += `${indent}  </attributes>\n`;
        }
        
        // Add text content if it exists
        if (element.textContent && element.textContent.trim()) {
          elementStr += `${indent}  <textContent>${this.escapeXml(element.textContent.trim())}</textContent>\n`;
        }
        
        // Add Vue component information if it exists
        if (element.vueComponent) {
          elementStr += `${indent}  <vueComponent>\n`;
          elementStr += `${indent}    <name>${this.escapeXml(element.vueComponent.name || 'Unknown')}</name>\n`;
          
          if (element.vueComponent.filename) {
            elementStr += `${indent}    <location>${this.escapeXml(element.vueComponent.filename)}</location>\n`;
          }
          
          elementStr += `${indent}  </vueComponent>\n`;
        }
        
        // Add children if they exist
        if (element.children && element.children.length > 0) {
          elementStr += `${indent}  <children>\n`;
          element.children.forEach(child => {
            elementStr += formatElement(child, depth + 2);
          });
          elementStr += `${indent}  </children>\n`;
        }
        
        elementStr += `${indent}</element>\n`;
        return elementStr;
      };
      
      // Format all root elements
      selectedElements.forEach(element => {
        formattedPrompt += formatElement(element);
      });
      
      formattedPrompt += `</selectedElements>`;
    }
    
    // Minify the formatted XML before returning
    return this.minifyXml(formattedPrompt);
  }

  // Helper method to minify XML
  minifyXml(xml) {
    if (!xml || typeof xml !== 'string') return xml;
    
    // Remove whitespace between tags, preserve whitespace within content
    return xml
      .replace(/>\s+</g, '><')        // Remove whitespace between tags
      .replace(/\n\s*/g, '')         // Remove newlines and indentation
      .replace(/\s+</g, '<')         // Remove whitespace before opening tags
      .replace(/>\s+/g, '>')         // Remove whitespace after closing tags
      .trim();                       // Trim leading/trailing whitespace
  }

  // Helper method to escape XML special characters
  escapeXml(text) {
    if (typeof text !== 'string') return text;
    
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Updated method for AI integration
  async callAI(prompt, selectedElements, pageInfo) {
    if (!this.aiEndpoint) {
      console.warn('No AI endpoint specified');
      return;
    }

    // Format the prompt using the updated formatPrompt method
    const formattedPrompt = this.formatPrompt(prompt, selectedElements, pageInfo);

    // Show loading UI
    this.showLoadingUI();

    try {
      const response = await fetch(`${this.aiEndpoint}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: formattedPrompt,
        })
      });

      if (!response.ok) {
        throw new Error(`AI request failed with status: ${response.status}`);
      }

      // Since it's SSE, we need to handle the stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              break;
            }

            // Decode the chunk
            const chunk = decoder.decode(value, { stream: true });
            
            // Process SSE data (optional - you can log or handle events here)
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  console.log('SSE data received:', data);
                } catch (e) {
                  // Ignore parsing errors for non-JSON data
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
      }

      console.log('AI request completed');
    } catch (error) {
      console.error('Error calling AI endpoint:', error);
    } finally {
      // Hide loading UI when connection ends
      this.hideLoadingUI();
    }
  }

  showLoadingUI() {
    const loadingOverlay = this.shadowRoot.getElementById('loadingOverlay');
    loadingOverlay.classList.add('show');
  }

  hideLoadingUI() {
    const loadingOverlay = this.shadowRoot.getElementById('loadingOverlay');
    loadingOverlay.classList.remove('show');
  }

}

// Register the custom element
customElements.define('inspector-toolbar', InspectorToolbar);
