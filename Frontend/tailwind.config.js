module.exports = {
  content: [
    './assets/pages/**/*.html',
    './assets/js/**/*.js',
    './assets/scss/**/*.scss'
  ],
  theme: {
    extend: {
      // Custom Colors
      colors: {
        primary: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ed4337', // Main brand color
          600: '#d63a2e',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
      },
      
      // Custom Animations
      animation: {
        // Fade animations
        'fade-in': 'fadeIn 0.6s ease-out',
        'fade-out': 'fadeOut 0.6s ease-out',
        'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        'fade-in-down': 'fadeInDown 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        'fade-in-left': 'fadeInLeft 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        'fade-in-right': 'fadeInRight 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        
        // Scale animations
        'scale-in': 'scaleIn 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        'scale-out': 'scaleOut 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        'zoom-in': 'zoomIn 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        'zoom-out': 'zoomOut 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        
        // Slide animations
        'slide-in-up': 'slideInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-in-down': 'slideInDown 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-in-left': 'slideInLeft 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-in-right': 'slideInRight 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        
        // Bounce animations
        'bounce-in': 'bounceIn 0.75s cubic-bezier(0.215, 0.61, 0.355, 1)',
        'bounce-out': 'bounceOut 0.75s cubic-bezier(0.215, 0.61, 0.355, 1)',
        
        // Rotate animations
        'rotate-in': 'rotateIn 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        'rotate-out': 'rotateOut 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        
        // Special effects
        'pulse-glow': 'glowPulse 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'gradient-shift': 'gradientShift 3s ease infinite',
        'spin-slow': 'spin 3s linear infinite',
        'spin-fast': 'spin 0.5s linear infinite',
        'heartbeat': 'heartbeat 1.5s ease-in-out infinite',
        'wobble': 'wobble 1s ease-in-out',
        'shake': 'shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97)',
        'swing': 'swing 1s ease-in-out',
        'blur-in': 'blurIn 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        'elastic-bounce': 'elasticBounce 1s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      
      // Keyframes
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeOut: {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          from: { opacity: '0', transform: 'translateY(-30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInLeft: {
          from: { opacity: '0', transform: 'translateX(-30px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        fadeInRight: {
          from: { opacity: '0', transform: 'translateX(30px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.9)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        scaleOut: {
          from: { opacity: '1', transform: 'scale(1)' },
          to: { opacity: '0', transform: 'scale(0.9)' },
        },
        zoomIn: {
          from: { opacity: '0', transform: 'scale(0.3)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        zoomOut: {
          from: { opacity: '1', transform: 'scale(1)' },
          to: { opacity: '0', transform: 'scale(0.3)' },
        },
        slideInUp: {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        slideInDown: {
          from: { transform: 'translateY(-100%)' },
          to: { transform: 'translateY(0)' },
        },
        slideInLeft: {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
        slideInRight: {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)' },
        },
        bounceOut: {
          '0%': { transform: 'scale(1)' },
          '25%': { transform: 'scale(0.95)' },
          '50%': { opacity: '1', transform: 'scale(1.1)' },
          '100%': { opacity: '0', transform: 'scale(0.3)' },
        },
        rotateIn: {
          from: { opacity: '0', transform: 'rotate(-200deg)' },
          to: { opacity: '1', transform: 'rotate(0)' },
        },
        rotateOut: {
          from: { opacity: '1', transform: 'rotate(0)' },
          to: { opacity: '0', transform: 'rotate(200deg)' },
        },
        glowPulse: {
          '0%, 100%': {
            boxShadow: '0 0 5px rgba(237, 67, 55, 0.5), 0 0 10px rgba(237, 67, 55, 0.3)',
          },
          '50%': {
            boxShadow: '0 0 10px rgba(237, 67, 55, 0.8), 0 0 20px rgba(237, 67, 55, 0.6)',
          },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '10%, 30%': { transform: 'scale(0.9)' },
          '20%, 40%, 50%, 60%, 70%, 80%': { transform: 'scale(1.1)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-10px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(10px)' },
        },
        wobble: {
          '0%, 100%': { transform: 'translateX(0) rotate(0deg)' },
          '15%': { transform: 'translateX(-25px) rotate(-5deg)' },
          '30%': { transform: 'translateX(20px) rotate(3deg)' },
          '45%': { transform: 'translateX(-15px) rotate(-3deg)' },
          '60%': { transform: 'translateX(10px) rotate(2deg)' },
          '75%': { transform: 'translateX(-5px) rotate(-1deg)' },
        },
        swing: {
          '20%': { transform: 'rotate(15deg)' },
          '40%': { transform: 'rotate(-10deg)' },
          '60%': { transform: 'rotate(5deg)' },
          '80%': { transform: 'rotate(-5deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        blurIn: {
          from: { opacity: '0', filter: 'blur(20px)' },
          to: { opacity: '1', filter: 'blur(0)' },
        },
        elasticBounce: {
          '0%': { transform: 'scale(1, 1)' },
          '30%': { transform: 'scale(1.25, 0.75)' },
          '40%': { transform: 'scale(0.75, 1.25)' },
          '50%': { transform: 'scale(1.15, 0.85)' },
          '65%': { transform: 'scale(0.95, 1.05)' },
          '75%': { transform: 'scale(1.05, 0.95)' },
          '100%': { transform: 'scale(1, 1)' },
        },
      },
      
      // Custom Box Shadows
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'soft-md': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'soft-lg': '0 8px 24px rgba(0, 0, 0, 0.12)',
        'soft-xl': '0 12px 40px rgba(0, 0, 0, 0.15)',
        'primary': '0 10px 30px rgba(237, 67, 55, 0.3)',
        'primary-lg': '0 20px 60px rgba(237, 67, 55, 0.4)',
        'glow': '0 0 20px rgba(237, 67, 55, 0.5)',
        'glow-strong': '0 0 10px rgba(237, 67, 55, 0.6), 0 0 20px rgba(237, 67, 55, 0.4), 0 0 30px rgba(237, 67, 55, 0.3)',
        'neumorphism': '12px 12px 24px rgba(0, 0, 0, 0.1), -12px -12px 24px rgba(255, 255, 255, 0.8)',
        'inner-soft': 'inset 0 2px 8px rgba(0, 0, 0, 0.1)',
      },
      
      // Custom Border Radius
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
        '6xl': '3rem',
      },
      
      // Custom Backdrop Blur
      backdropBlur: {
        xs: '2px',
      },
      
      // Custom Transition
      transitionDuration: {
        '0': '0ms',
        '2000': '2000ms',
      },
      
      // Custom Z-Index
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [],
}
