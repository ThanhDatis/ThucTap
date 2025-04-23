const canvas = document.getElementById('heroCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Particle system configuration
const particles = [];
const particleCount = 100;
const particleColors = ['rgba(255, 255, 255, 0.5)', 'rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.1)'];
const mousePosition = { x: null, y: null, radius: 120 };

// 1) Smoke effect setup
const smokeParticles = [];
const smokeCount = 50;
function initSmoke() {
  for (let i = 0; i < smokeCount; i++) {
    smokeParticles.push({
      x: Math.random() * canvas.width,
      y: canvas.height + Math.random() * 200,
      size: Math.random() * 80 + 40,
      speedY: Math.random() * 0.5 + 0.2,
      alpha: Math.random() * 0.3 + 0.1
    });
  }
}
function updateAndDrawSmoke() {
  smokeParticles.forEach((p, i) => {
    // move up & fade
    p.y     -= p.speedY;
    p.alpha -= 0.0005;
    // restart if tỏ hoặc đi khỏi canvas
    if (p.y + p.size < 0 || p.alpha <= 0) {
      smokeParticles[i] = {
        x: Math.random() * canvas.width,
        y: canvas.height + Math.random() * 100,
        size: Math.random() * 80 + 40,
        speedY: Math.random() * 0.5 + 0.2,
        alpha: Math.random() * 0.3 + 0.1
      };
    }
    // draw radial gradient smoke
    const grad = ctx.createRadialGradient(
      p.x, p.y, 0,
      p.x, p.y, p.size
    );
    grad.addColorStop(0, `rgba(255,255,255,${p.alpha})`);
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });
}

// Initialize particles
function initParticles() {
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 5 + 1,
      speedX: Math.random() * 3 - 1.5,
      speedY: Math.random() * 3 - 1.5,
      color: particleColors[Math.floor(Math.random() * particleColors.length)]
    });
  }
}

// Handle mouse movement
canvas.addEventListener('mousemove', (e) => {
  mousePosition.x = e.x;
  mousePosition.y = e.y;
});

canvas.addEventListener('mouseleave', () => {
  mousePosition.x = null;
  mousePosition.y = null;
});

// Animate function
function animate(timestamp) {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw gradient background
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, `hsl(${(timestamp / 100) % 360}, 70%, 50%)`);
  gradient.addColorStop(0.5, `hsl(${((timestamp / 100) + 40) % 360}, 80%, 60%)`);
  gradient.addColorStop(1, `hsl(${((timestamp / 100) + 80) % 360}, 70%, 50%)`);
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw an overlaid, flowing gradient blob with a sine‑wave edge
  drawGradientBlob(timestamp);
  
  // 2) Vẽ khói sau blob để khói nổi trên nền
  updateAndDrawSmoke();
  
  // Draw and update particles
  particles.forEach(particle => {
    // Draw particle
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fillStyle = particle.color;
    ctx.fill();
    
    // Update position
    particle.x += particle.speedX;
    particle.y += particle.speedY;
    
    // Mouse interaction
    if (mousePosition.x != null) {
      const dx = mousePosition.x - particle.x;
      const dy = mousePosition.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < mousePosition.radius) {
        const angle = Math.atan2(dy, dx);
        const force = (mousePosition.radius - distance) / mousePosition.radius;
        
        particle.x -= Math.cos(angle) * force * 5;
        particle.y -= Math.sin(angle) * force * 5;
      }
    }
    
    // Boundary check
    if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
    if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
  });
  
  // Create wave path
  ctx.beginPath();
  ctx.moveTo(0, canvas.height * 0.7);
  for (let x = 0; x < canvas.width; x++) {
    ctx.lineTo(
      x,
      canvas.height * 0.7
        + Math.sin(x / 50 + timestamp / 1000) * 20
    );
  }
  ctx.lineTo(canvas.width, canvas.height);
  ctx.lineTo(0, canvas.height);
  ctx.closePath();
  
  // Apply vertical gradient on the wave
  const waveGradient = ctx.createLinearGradient(
    0,
    canvas.height * 0.7,
    0,
    canvas.height
  );
  waveGradient.addColorStop(
    0,
    `hsla(${((timestamp / 100) + 40) % 360}, 90%, 70%, 0.3)`
  );
  waveGradient.addColorStop(
    1,
    `hsla(${((timestamp / 100)) % 360}, 90%, 60%, 0.1)`
  );
  
  ctx.fillStyle = waveGradient;
  ctx.fill();
  
  requestAnimationFrame(animate);
}

// Add this below initParticles() / above animate()
function drawGradientBlob(timestamp) {
  const waveY     = canvas.height * 0.3;
  const amplitude = canvas.height * 0.1;
  
  // Blend mode so colors mix nicely
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  
  // Build a sine‑wave path
  ctx.beginPath();
  ctx.moveTo(0, waveY);
  for (let x = 0; x <= canvas.width; x += 10) {
    const y = waveY + Math.sin(x / 150 + timestamp / 2000) * amplitude;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(canvas.width, 0);
  ctx.lineTo(0, 0);
  ctx.closePath();
  
  // Horizontal gradient across the blob
  const blobGrad = ctx.createLinearGradient(0, 0, canvas.width, 0);
  blobGrad.addColorStop(0, `hsla(${((timestamp / 100) + 30) % 360}, 80%, 60%, 0.3)`);
  blobGrad.addColorStop(1, `hsla(${((timestamp / 100) + 90) % 360}, 80%, 60%, 0.3)`);
  
  ctx.fillStyle = blobGrad;
  ctx.fill();
  ctx.restore();
}

// Initialize and start animation
initParticles();
initSmoke();            // khởi tạo smoke
animate(0);

// Mobile menu functionality
document.addEventListener('DOMContentLoaded', () => {
  // Add mobile menu toggle
  const headerContainer = document.querySelector('.header-container');
  const headerNav = document.querySelector('.header-nav');
  
  // Create mobile menu toggle
  const mobileMenuToggle = document.createElement('div');
  mobileMenuToggle.className = 'mobile-menu-toggle';
  mobileMenuToggle.innerHTML = `
    <span></span>
    <span></span>
    <span></span>
  `;
  
  // Add scroll indicator
  const scrollIndicator = document.createElement('div');
  scrollIndicator.className = 'header-scroll-indicator';
  headerContainer.appendChild(scrollIndicator);
  
  // Insert mobile menu toggle before the header navigation
  document.querySelector('.header-container-nav').insertBefore(
    mobileMenuToggle, 
    document.querySelector('.header-nav')
  );
  
  // Toggle mobile menu
  mobileMenuToggle.addEventListener('click', () => {
    mobileMenuToggle.classList.toggle('active');
    headerNav.classList.toggle('active');
    document.body.classList.toggle('menu-open');
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (
      headerNav.classList.contains('active') &&
      !headerNav.contains(e.target) &&
      !mobileMenuToggle.contains(e.target)
    ) {
      mobileMenuToggle.classList.remove('active');
      headerNav.classList.remove('active');
      document.body.classList.remove('menu-open');
    }
  });
  
  // Handle header scroll effects
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      headerContainer.classList.add('scrolled');
    } else {
      headerContainer.classList.remove('scrolled');
    }
  });
  
  // Handle window resize
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Close mobile menu on larger screens
    if (window.innerWidth > 768 && headerNav.classList.contains('active')) {
      mobileMenuToggle.classList.remove('active');
      headerNav.classList.remove('active');
      document.body.classList.remove('menu-open');
    }
  });
});
