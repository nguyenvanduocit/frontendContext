class InspectorToolbar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.isExpanded = false;
    this.isInspecting = false;
    this.selectedElements = new Map();
    this.colorIndex = 0;
    this.colors = [
      '#FF6B6B', '#FF9671', '#FFA75F', '#F9D423', '#FECA57',
      '#FF9FF3', '#FF7E67', '#FF8C42', '#FFC857', '#FFA26B'
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
          right: 40px;
          z-index: 999999;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
          
        }

        :host * {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;

        }

        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          14% {
            background-position: 23% 77%;
          }
          27% {
            background-position: 52% 68%;
          }
          41% {
            background-position: 79% 42%;
          }
          56% {
            background-position: 95% 21%;
          }
          73% {
            background-position: 62% 30%;
          }
          88% {
            background-position: 31% 47%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes blinkEye {
          0%, 90%, 100% {
            transform: scaleY(1);
          }
          95% {
            transform: scaleY(0.1);
          }
        }
          

        @keyframes glowingAura {
          0% {
            box-shadow: 0 0 10px 5px rgba(255, 107, 107, 0.4), 0 0 20px 10px rgba(255, 150, 113, 0.2), 0 0 0 2px rgba(255, 255, 255, 0.1);
          }
          13% {
            box-shadow: 0 0 18px 12px rgba(249, 212, 35, 0.5), 0 0 28px 15px rgba(254, 202, 87, 0.3), 0 0 0 3px rgba(255, 255, 255, 0.16);
          }
          27% {
            box-shadow: 0 0 15px 8px rgba(255, 159, 243, 0.6), 0 0 24px 11px rgba(255, 140, 66, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.12);
          }
          42% {
            box-shadow: 0 0 22px 14px rgba(255, 200, 87, 0.55), 0 0 30px 16px rgba(255, 107, 107, 0.28), 0 0 0 4px rgba(255, 255, 255, 0.18);
          }
          58% {
            box-shadow: 0 0 12px 7px rgba(255, 166, 107, 0.45), 0 0 19px 9px rgba(255, 126, 103, 0.25), 0 0 0 2px rgba(255, 255, 255, 0.11);
          }
          73% {
            box-shadow: 0 0 20px 13px rgba(249, 212, 35, 0.62), 0 0 26px 14px rgba(255, 150, 113, 0.42), 0 0 0 3px rgba(255, 255, 255, 0.22);
          }
          87% {
            box-shadow: 0 0 16px 9px rgba(255, 107, 107, 0.53), 0 0 22px 13px rgba(254, 202, 87, 0.32), 0 0 0 2px rgba(255, 255, 255, 0.14);
          }
          100% {
            box-shadow: 0 0 10px 5px rgba(255, 107, 107, 0.4), 0 0 20px 10px rgba(255, 150, 113, 0.2), 0 0 0 2px rgba(255, 255, 255, 0.1);
          }
        }

        .toolbar-button {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: linear-gradient(135deg, #FF6B6B, #FF9671, #FFA75F, #F9D423, #FECA57, #FF7E67, #FF8C42, #FFC857);
          background-size: 400% 400%;
          animation: gradientShift 7.3s ease-in-out infinite, glowingAura 9.7s infinite cubic-bezier(0.42, 0, 0.58, 1);
          border: none;
          color: white;
          cursor: pointer;
          filter: drop-shadow(0 0 8px rgba(255, 107, 107, 0.5));
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          position: relative;
          z-index: 10000000;
        }

        .toolbar-button::before {
          content: '';
          position: absolute;
          inset: -10px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 107, 107, 0.3) 0%, rgba(255, 140, 66, 0.2) 50%, rgba(249, 212, 35, 0.1) 70%, transparent 100%);
          filter: blur(10px);
          opacity: 0.7;
          z-index: -1;
          animation: rotateMist 13.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
          transition: all 0.5s ease;
        }

        @keyframes rotateMist {
          0% {
            transform: rotate(0deg) scale(1);
          }
          17% {
            transform: rotate(83deg) scale(1.15) translateX(3px);
          }
          31% {
            transform: rotate(127deg) scale(0.95) translateY(-4px);
          }
          48% {
            transform: rotate(195deg) scale(1.12) translateX(-2px) translateY(3px);
          }
          63% {
            transform: rotate(246deg) scale(1.05) translateY(5px);
          }
          79% {
            transform: rotate(301deg) scale(0.97) translateX(4px) translateY(-2px);
          }
          91% {
            transform: rotate(342deg) scale(1.08) translateY(-3px);
          }
          100% {
            transform: rotate(360deg) scale(1);
          }
        }

        .toolbar-button:hover {
          transform: scale(1.1);
        }
        
        .toolbar-button:hover::before {
          inset: -15px;
          filter: blur(15px);
          opacity: 0.9;
        }
        
        .toolbar-button.active {
          background-size: 400% 400%;
          animation: gradientShift 5.2s cubic-bezier(0.36, 0.11, 0.89, 0.32) infinite;
          transform: scale(1.15);
        }
        
        .toolbar-button.active::before {
          inset: -20px;
          filter: blur(20px);
          opacity: 1;
          animation: rotateMist 9.7s cubic-bezier(0.34, 0.82, 0.6, 0.23) infinite;
        }

        .toolbar-button .icon {
          width: 25px;
          height: 25px;
          animation: blinkEye 5s infinite;
        }

        .toolbar-card {
          cursor: auto !important;
          position: absolute;
          bottom: 30px;
          right: -13px;
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
          padding: 4px 8px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          height: 26px;
          line-height: 1.3;
        }

        .inspect-button {
          background: #4b83da;
          border: 1px solid #2d5ca8;
          color: white;
        }

        .inspect-button:hover {
          background: #3a72c9;
          transform: translateY(-1px);
          box-shadow: 0 3px 6px rgba(59, 130, 246, 0.2);
        }
        
        .inspect-button:active {
          transform: translateY(0);
          background: #2c5aa0;
        }

        .close-button {
          background: #e05252;
          border: 1px solid #b03e3e;
          color: white;
          display: none;
        }

        .close-button:hover {
          background: #cc4545;
          transform: translateY(-1px);
          box-shadow: 0 3px 6px rgba(224, 82, 82, 0.2);
        }
        
        .close-button:active {
          transform: translateY(0);
          background: #b73a3a;
        }

        .reset-button {
          background: #4ead88;
          border: 1px solid #3a8a68;
          color: white;
        }

        .reset-button:hover {
          background: #419a78;
          transform: translateY(-1px);
          box-shadow: 0 3px 6px rgba(78, 173, 136, 0.2);
        }
        
        .reset-button:active {
          transform: translateY(0);
          background: #358a6c;
        }

        .inspecting .close-button {
          display: inline-flex;
        }

        .inspecting .inspect-button {
          display: none;
        }

        .icon {
          width: 18px;
          height: 18px;
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
          <textarea rows="2" autocomplete="off" type="text" class="toolbar-input" id="promptInput" placeholder="Type your prompt then press Enter"></textarea>
        </div>
        
        <div class="toolbar-actions">
          <button class="action-button reset-button" id="resetButton">
            <span>Reset</span>
          </button>
          <button class="action-button inspect-button" id="inspectButton">
            <span>Inspect</span>
          </button>
          <button class="action-button close-button" id="closeInspectButton">
            <span>Cancel</span>
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
    const promptInput = this.shadowRoot.getElementById('promptInput');
    const resetButton = this.shadowRoot.getElementById('resetButton');

    // Toggle expand/collapse
    toggleButton.addEventListener('click', (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      evt.stopImmediatePropagation();

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
        
        // Exit inspection mode and clear selections when closing the panel
        if (this.isInspecting) {
          this.exitInspectionMode();
        }
        this.clearAllSelections();
        this.hideLoadingUI();
        promptInput.value = '';
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

    // Reset chat button
    resetButton.addEventListener('click', () => {
      // Clear the input field
      promptInput.value = '';
      // Clear all selections
      this.clearAllSelections();
      this.enterInspectionMode();
      // Send reset chat request
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
    setTimeout(() => {
      const promptInput = this.shadowRoot.getElementById('promptInput');
      promptInput.focus();
    }, 100);

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
    
    // Ignore badges and elements inside badges
    if (this.shouldIgnoreElement(e.target)) return;

    this.removeHoverHighlight();

    // Don't highlight already selected elements
    if (!this.selectedElements.has(e.target)) {
      e.target.style.outline = '3px solid #3B82F6';
      e.target.style.outlineOffset = '-1px';
      this.currentHoveredElement = e.target;
    }
  }

  handleMouseOut = (e) => {
    if (e.target === this || this.contains(e.target)) return;
    
    // Ignore badges and elements inside badges
    if (this.shouldIgnoreElement(e.target)) return;

    // Only remove hover highlight if element is not selected
    if (!this.selectedElements.has(e.target)) {
      e.target.style.outline = '';
      e.target.style.outlineOffset = '';
    }
  }

  handleElementClick = (e) => {
    if (e.target === this || this.contains(e.target)) return;
    
    // Ignore badges and elements inside badges
    if (this.shouldIgnoreElement(e.target)) return;

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
    element.style.outlineOffset = '-1px';

    // Create badge
    const badge = this.createBadge(index, color, element);
    this.badges.set(element, badge);

    this.selectedElements.set(element, {
      color: color,
      originalOutline: element.style.outline,
      originalOutlineOffset: element.style.outlineOffset,
      index: index
    });
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
    badge.classList.add('inspector-badge');
    
    // Create shadow DOM for badge
    const shadow = badge.attachShadow({ mode: 'open' });
    
    // Create style element
    const style = document.createElement('style');
    style.textContent = `
      .badge {
        height: 20px;
        padding: 0 5px;
        background-color: ${color};
        color: white;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: bold;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        pointer-events: none;
      }
    `;
    
    // Create badge content
    const badgeContent = document.createElement('div');
    badgeContent.classList.add('badge');
    badgeContent.classList.add('inspector-ignore');

    const component = this.findNearestComponent(element);
    if (component && component.componentLocation) {
      const componentPath = component.componentLocation.split('@')[0];
      const fileName = componentPath.split('/').pop();
      badgeContent.textContent = "(" + index + ") " + "[" + fileName + "]";
    } else {
      badgeContent.textContent = "(" + index + ") " + element.tagName;
    }
    
    // Append style and content to shadow DOM
    shadow.appendChild(style);
    shadow.appendChild(badgeContent);
    
    // Position variables
    const topMargin = -15;
    const leftMargin = 7;
    
    // Position badge relative to element
    const rect = element.getBoundingClientRect();
    badge.style.position = 'fixed';
    badge.style.top = `${rect.top + topMargin}px`;
    badge.style.left = `${rect.left + leftMargin}px`;
    badge.style.zIndex = '999998'; // High z-index to show above other elements

    document.body.appendChild(badge);

    // Update badge position on scroll/resize
    const updatePosition = () => {
      const rect = element.getBoundingClientRect();
      badge.style.top = `${rect.top + topMargin}px`;
      badge.style.left = `${rect.left + leftMargin}px`;
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

    this.selectedElements.forEach((data, element) => {
      data.index = index;

      // Update badge
      const badge = this.badges.get(element);
      if (badge) {
        // Update badge content inside shadow DOM
        const badgeContent = badge.shadowRoot?.querySelector('.badge');
        if (badgeContent) {
          badgeContent.textContent = "(" + index + ") " + element.tagName;
        }
      }

      index++;
    });
  }

  // Thêm method mới để ngăn chặn mouse events
  preventMouseEvents = (e) => {
    if (e.target === this || this.contains(e.target)) return;
    
    // Ignore badges and elements inside badges
    if (this.shouldIgnoreElement(e.target)) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  }

  // Helper method to check if an element should be ignored during inspection
  shouldIgnoreElement(element) {
    // Check if element is a badge
    if (element.classList && element.classList.contains('inspector-badge')) {
      return true;
    }
    
    // Check if element is inside a badge (including shadow DOM content)
    let currentElement = element;
    while (currentElement) {
      // Check if current element is a badge
      if (currentElement.classList && currentElement.classList.contains('inspector-badge')) {
        return true;
      }
      
      // Check if current element has inspector-ignore class
      if (currentElement.classList && currentElement.classList.contains('inspector-ignore')) {
        return true;
      }
      
      // Move up the DOM tree, handling shadow DOM boundaries
      if (currentElement.parentNode) {
        currentElement = currentElement.parentNode;
      } else if (currentElement.host) {
        // If we're in a shadow DOM, move to the host element
        currentElement = currentElement.host;
      } else {
        break;
      }
    }
    
    return false;
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


  // Add method to generate XPath for an element
  generateXPath(element) {
    if (!element) return '';
    if (element === document.body) return '//body';
    if (element === document.documentElement) return '/html';

    const steps = [];
    let contextNode = element;
    
    while (contextNode) {
      const step = this.getXPathStep(contextNode, contextNode === element);
      if (!step) {
        break;  // Error - bail out early.
      }
      steps.push(step);
      if (step.optimized) {
        break;  // We found an optimized step (like an ID), so we can stop here
      }
      contextNode = contextNode.parentNode;
      
      // Stop if we reached the document node
      if (!contextNode || contextNode.nodeType === Node.DOCUMENT_NODE) {
        break;
      }
    }

    steps.reverse();
    return (steps.length && steps[0].optimized ? '' : '/') + steps.join('/');
  }

  getXPathStep(node, isTargetNode) {
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return null;  // Only handle element nodes
    }

    // For optimized XPath, check for ID first
    const id = node.getAttribute('id');
    if (id && this.isValidId(id)) {
      // Make sure the ID is unique in the document
      if (document.querySelectorAll(`#${CSS.escape(id)}`).length === 1) {
        return {
          value: `//*[@id="${id}"]`,
          optimized: true,
          toString() { return this.value; }
        };
      }
    }

    const nodeName = node.nodeName.toLowerCase();
    
    // Handle special elements
    if (nodeName === 'body' || nodeName === 'head' || nodeName === 'html') {
      return {
        value: nodeName,
        optimized: true,
        toString() { return this.value; }
      };
    }

    // Find the position among siblings of the same type
    const ownIndex = this.getXPathIndex(node);
    if (ownIndex === -1) {
      return null;  // Error occurred
    }

    let ownValue = nodeName;
    
    // Handle input elements with type attribute
    if (isTargetNode && nodeName === 'input' && node.getAttribute('type') && !id && !node.getAttribute('class')) {
      ownValue += `[@type="${node.getAttribute('type')}"]`;
    }

    // Add index if needed
    if (ownIndex > 0) {
      ownValue += `[${ownIndex + 1}]`;
    }

    return {
      value: ownValue,
      optimized: false,
      toString() { return this.value; }
    };
  }

  getXPathIndex(node) {
    // Check if we need an index by seeing if there are similar siblings
    const siblings = node.parentNode ? node.parentNode.children : null;
    if (!siblings) {
      return 0;  // No siblings
    }
    
    // Helper function to check if nodes are similar (same tag name)
    const areNodesSimilar = (left, right) => {
      if (left === right) return true;
      if (left.nodeType === Node.ELEMENT_NODE && right.nodeType === Node.ELEMENT_NODE) {
        return left.nodeName.toLowerCase() === right.nodeName.toLowerCase();
      }
      return false;
    };
    
    // Check if there are any similar siblings
    let hasSameNamedElements = false;
    for (let i = 0; i < siblings.length; ++i) {
      if (areNodesSimilar(node, siblings[i]) && siblings[i] !== node) {
        hasSameNamedElements = true;
        break;
      }
    }
    
    if (!hasSameNamedElements) {
      return 0;  // No similar siblings, no need for index
    }
    
    // Count same-named elements up to this one
    let ownIndex = 0;
    for (let i = 0; i < siblings.length; ++i) {
      if (areNodesSimilar(node, siblings[i])) {
        if (siblings[i] === node) {
          return ownIndex;
        }
        ++ownIndex;
      }
    }
    
    return -1;  // Error: node not found among siblings
  }
  
  isValidId(id) {
    // Basic validation to ensure the ID is usable in a selector
    return id && /^[^\s].*$/.test(id) && !/[[\](){}<>]/.test(id);
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
        let componentData = this.findNearestComponent(element);
        

        const elementInfo = {
          index: data.index,
          tagName: element.tagName,
          xpath: this.generateXPath(element),
          textContent: element.textContent?.substring(0, 100) || '',
          attributes: Array.from(element.attributes).reduce((acc, attr) => {
            if (attr.name !== 'style') {
              acc[attr.name] = attr.value;
            }
            return acc;
          }, {}),
          children: []
        };
        
        // Add  component info directly to the element if available
        if (componentData) {
          elementInfo.componentData = componentData;
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
      // Do NOT clear the input here - it will only be cleared if the request succeeds
      this.callAI(prompt, selectedElementsHierarchy, pageInfo);
    } else {
      console.warn('No AI endpoint provided. Set the ai-endpoint attribute to use AI features.');
    }
  }

  // New method to get current page information
  getCurrentPageInfo() {
    const pageInfo = {
      url: window.location.href,
      title: document.title,
    };

    return pageInfo;
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
      const componentInfo = window.__VUE__ ? this.getVueComponentInfo(element) : this.getVanillaComponentInfo(element);
      
      // If we found a component and it's not Primitive, return it
      if (componentInfo) {
        return componentInfo;
      }
      
      // Continue up the tree if we didn't find a component or found a Primitive
      return this.findNearestComponent(element.parentElement);
    } catch (e) {
      console.error('Error finding nearest component:', e);
      return null;
    }
  }

  // search for data-component-name and data-component-filename if present
  getVanillaComponentInfo(element) {
    const componentName = element.getAttribute('data-component-name');
    const componentFile = element.getAttribute('data-component-file');

    if (!componentName && !componentFile) {
      return null;
    }

    return {
      componentLocation: componentFile + "@" + componentName
    }
  }
  
  // Get Vue component information for a DOM element
  getVueComponentInfo(element) {
    if (!element) return null;
    
    const codeLocation = element.__vnode?.props?.__v_inspector ?? element.__vueParentComponent?.vnode?.props?.__v_inspector

    if (!codeLocation) {
      return null;
    }

    return {
      componentLocation: codeLocation,
    }
  }

  formatPrompt(userPrompt, selectedElements, pageInfo) {
    // Build the formatted prompt with top-level XML tags but JSON content inside
    let formattedPrompt = `<userRequest>${userPrompt}</userRequest>`;
    
    // Replacer function to filter out empty values
    const replacer = (key, value) => {
      // Filter out empty strings, empty arrays, and null values
      if (value === "" || (Array.isArray(value) && value.length === 0) || value === null) {
        return undefined; // This will remove the property
      }
      return value;};
    
    // Add page information as JSON
    if (pageInfo) {
      formattedPrompt += `<pageInfo>${JSON.stringify(pageInfo, replacer)}</pageInfo>`;
    }
    
    // Add selected elements as JSON
    if (selectedElements && selectedElements.length > 0) {
      formattedPrompt += `<inspectedElements>${JSON.stringify(selectedElements, replacer)}</inspectedElements>`;
    }
    
    return formattedPrompt;
  }

  // Updated method for AI integration
  async callAI(prompt, selectedElements, pageInfo) {
    if (!this.aiEndpoint) {
      console.warn('No AI endpoint specified');
      return;
    }

    // Get reference to the prompt input for later use
    const promptInput = this.shadowRoot.getElementById('promptInput');
    // Store the original prompt text
    const originalPromptText = promptInput.value;
    
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
      
      // On success: Clear the input and hide loading UI
      promptInput.value = '';
      this.hideLoadingUI();
    } catch (error) {
      console.error('Error calling AI endpoint:', error);
      
      // On error: Keep the original prompt text in the input field
      promptInput.value = originalPromptText;
      
      // Show error message to user
      this.showErrorMessage(error.message || 'Failed to connect to AI service');
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
  
  showErrorMessage(message) {
    const loadingOverlay = this.shadowRoot.getElementById('loadingOverlay');
    const loadingContent = loadingOverlay.querySelector('.loading-content');
    const loadingText = loadingContent.querySelector('.loading-text');
    
    loadingText.textContent = `Error: ${message}`;
    loadingText.style.color = '#e05252';
    
    // Keep the error visible for a few seconds
    loadingOverlay.classList.add('show');
    setTimeout(() => {
      loadingOverlay.classList.remove('show');
      // Reset the loading text back to normal
      loadingText.textContent = 'Making request, pls check in the Cursor';
      loadingText.style.color = '#374151';
    }, 3000);
  }

}

// Register the custom element
customElements.define('inspector-toolbar', InspectorToolbar);
