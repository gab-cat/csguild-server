/* eslint-disable max-len */
(function () {
  function initSwaggerCustomizations() {
    console.log('🚀 Initializing Swagger customizations...');

    // Add custom header
    const container = document.querySelector('.swagger-ui');
    if (container && !container.querySelector('.custom-header')) {
      const header = document.createElement('div');
      header.className = 'custom-header';

      const headerContent = [
        '<div style="background: #111111; padding: 20px 0; border-bottom: 1px solid #333333; margin-bottom: 20px;">',
        '<div style="max-width: 1200px; margin: 0 auto; padding: 0 20px; display: flex; ' +
          'align-items: center; justify-content: space-between;">',
        '<div>',
        '<h1 style="color: #00ff88; font-size: 24px; font-weight: 600; margin: 0; ' +
          'display: flex; align-items: center;">',
        '🚀 API Documentation',
        '<span style="background: rgba(0, 255, 136, 0.1); color: #00ff88; ' +
          'padding: 4px 12px; border-radius: 20px; font-size: 12px; margin-left: 15px;">v1.0.0</span>',
        '</h1>',
        '<p style="color: #888888; margin: 5px 0 0 0; font-size: 14px;">' +
          'Comprehensive NestJS Authentication API</p>',
        '</div>',
        '<div style="display: flex; gap: 12px;">',
        '<a href="/logs" style="background: #00ff88; color: #0a0a0a; ' +
          'padding: 8px 16px; border-radius: 8px; text-decoration: none; ' +
          'font-weight: 600; font-size: 12px; transition: all 0.2s ease;">🔍 Log Viewer</a>',
        '<a href="/health" style="background: #1a1a1a; color: #00aaff; ' +
          'padding: 8px 16px; border-radius: 8px; text-decoration: none; ' +
          'font-weight: 600; font-size: 12px; border: 1px solid #333333; ' +
          'transition: all 0.2s ease;">⚡ Health Check</a>',
        '</div>',
        '</div>',
        '</div>',
      ].join('');

      header.innerHTML = headerContent;
      container.insertBefore(header, container.firstChild);
      console.log('✅ Custom header added');
    }

    // Enhance operation blocks with additional styling
    const blocks = document.querySelectorAll('.opblock');
    if (blocks.length > 0) {
      blocks.forEach(function (block) {
        block.addEventListener('mouseenter', function () {
          this.style.transform = 'translateY(-2px)';
          this.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.6)';
          this.style.transition = 'all 0.3s ease';
        });

        block.addEventListener('mouseleave', function () {
          this.style.transform = 'translateY(0)';
          this.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.4)';
        });
      });
      console.log('✅ Enhanced', blocks.length, 'operation blocks');
    }

    // Add smooth scrolling to anchors
    const anchors = document.querySelectorAll('a[href^="#"]');
    if (anchors.length > 0) {
      anchors.forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
          e.preventDefault();
          const target = document.querySelector(this.getAttribute('href'));
          if (target) {
            target.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
          }
        });
      });
      console.log('✅ Added smooth scrolling to', anchors.length, 'anchors');
    }

    // Add loading state to execute buttons
    const executeButtons = document.querySelectorAll('.btn.execute');
    if (executeButtons.length > 0) {
      executeButtons.forEach(function (btn) {
        // Remove any existing listeners
        btn.removeEventListener('click', btn._customClickHandler);

        btn._customClickHandler = function () {
          const originalText = this.textContent;
          this.textContent = '⏳ Executing...';
          this.style.opacity = '0.7';
          this.disabled = true;

          setTimeout(function () {
            btn.textContent = originalText;
            btn.style.opacity = '1';
            btn.disabled = false;
          }, 2000);
        };

        btn.addEventListener('click', btn._customClickHandler);
      });
      console.log('✅ Enhanced', executeButtons.length, 'execute buttons');
    }

    // Auto-expand first operation group for better UX
    setTimeout(function () {
      const firstOpblock = document.querySelector('.opblock:not(.is-open)');
      if (firstOpblock) {
        const summary = firstOpblock.querySelector('.opblock-summary');
        if (summary) {
          summary.click();
          console.log('✅ Auto-expanded first operation');
        }
      }
    }, 800);

    // Add custom favicon
    let favicon = document.querySelector('link[rel="icon"]');
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      document.head.appendChild(favicon);
    }
    favicon.href =
      'data:image/svg+xml;charset=utf-8,' +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🚀</text></svg>',
      );
    console.log('✅ Custom favicon set');

    // Custom console greeting
    console.log(
      '%c🚀 NestJS Auth API Documentation',
      'color: #00ff88; font-size: 16px; font-weight: bold;',
    );
    console.log(
      '%cWelcome to the API docs! Try out the endpoints below.',
      'color: #888888; font-size: 12px;',
    );
    console.log(
      '%c✨ All customizations loaded successfully!',
      'color: #00ff88; font-weight: bold;',
    );
  }

  // Multiple initialization strategies to ensure it works

  // Strategy 1: DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSwaggerCustomizations);
  } else {
    initSwaggerCustomizations();
  }

  // Strategy 2: Window load (backup)
  window.addEventListener('load', function () {
    setTimeout(initSwaggerCustomizations, 500);
  });

  // Strategy 3: Periodic retry for Swagger UI async loading
  let retryCount = 0;
  const maxRetries = 10;

  function retryInit() {
    if (retryCount >= maxRetries) return;

    const swaggerContainer = document.querySelector('.swagger-ui');
    if (swaggerContainer && !swaggerContainer.querySelector('.custom-header')) {
      retryCount++;
      setTimeout(function () {
        initSwaggerCustomizations();
        if (retryCount < maxRetries) {
          setTimeout(retryInit, 1000);
        }
      }, 1000 * retryCount);
    }
  }

  // Start retry mechanism
  setTimeout(retryInit, 1000);
})();
