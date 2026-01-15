/*=============== HIDE & SHOW PASSWORD ===============*/
const showHiddenPass = (password, eye) => {
   const input = document.getElementById(password),
         iconEye = document.getElementById(eye)

   iconEye.addEventListener('click', () => {
      input.type === 'password' ? input.type = 'text'
                                : input.type = 'password'

      iconEye.classList.toggle('ri-eye-off-line')
      iconEye.classList.toggle('ri-eye-line')
   })
}
showHiddenPass('password','loginEye')

/*=============== SWIPER IMAGES ===============*/
const swiperLogin = new Swiper('.login__swiper', {
   loop: true,
   spaceBetween: '24',
   grabCursor: true,
   speed: 600,
   // effect: 'fade',

   pagination: {
      el: '.swiper-pagination',
      clickable: true,
   },

   autoplay: {
      delay: 3000,
      disableOnInteraction: false,
   },
})

/*=============== LOGIN FUNCTIONALITY ===============*/
const API_BASE_URL = 'http://127.0.0.1:8000/api';

document.addEventListener('DOMContentLoaded', function() {
   const loginForm = document.querySelector('.login__form');
   const loginBtn = document.getElementById('loginBtn');
   const errorElement = document.getElementById('error');

   if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
         e.preventDefault();
         
         const email = document.getElementById('email').value;
         const password = document.getElementById('password').value;
         
         if (!email || !password) {
            errorElement.textContent = 'Please fill in all fields';
            return;
         }

         // Disable button during login
         loginBtn.disabled = true;
         loginBtn.textContent = 'Logging in...';
         errorElement.textContent = '';

         try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
               method: 'POST',
               headers: {
                  'Content-Type': 'application/json',
               },
               body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
               // Save token to sessionStorage (more secure and consistent with auth-guard.js)
               sessionStorage.setItem('token', data.access_token);
               
               // Decode token to get user info
               const tokenPayload = JSON.parse(atob(data.access_token.split('.')[1]));
               sessionStorage.setItem('user', JSON.stringify(tokenPayload));
               
               // Show success message
               errorElement.className = 'text-green-500 mt-2';
               errorElement.textContent = 'Login successful! Redirecting...';
               
               // Redirect based on role
               setTimeout(() => {
                  const roles = tokenPayload.roles || [];
                  
                  if (roles.includes('ADMIN')) {
                     window.location.href = '../pages/admin-dashboard.html';
                  } else if (roles.includes('BANK')) {
                     window.location.href = '../pages/bank-dashboard.html';
                  } else if (roles.includes('SME')) {
                     window.location.href = '../pages/sme-dashboard.html';
                  } else if (roles.includes('BUYER')) {
                     window.location.href = '../pages/buyer-dashboard.html';
                  } else {
                     window.location.href = '../pages/dashboard.html';
                  }
               }, 1000);
            } else {
               // Show error
               errorElement.className = 'text-red-500 mt-2';
               errorElement.textContent = data.detail || 'Invalid credentials';
               loginBtn.disabled = false;
               loginBtn.textContent = 'Log In';
            }
         } catch (error) {
            console.error('Login error:', error);
            errorElement.className = 'text-red-500 mt-2';
            errorElement.textContent = 'Network error. Please check if the backend is running.';
            loginBtn.disabled = false;
            loginBtn.textContent = 'Log In';
         }
      });
   }
});
