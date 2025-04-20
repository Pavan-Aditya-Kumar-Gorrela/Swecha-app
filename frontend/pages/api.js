const apiService = {
    async signup(email, password) {
      try {
        const response = await fetch('http://192.168.91.183:2002/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        return await response.json();
      } catch (error) {
        throw new Error('Signup failed');
      }
    },
  
    async login(email, password) {
      try {
        const response = await fetch('http://192.168.91.183:2002/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        return await response.json();
      } catch (error) {
        throw new Error('Login failed');
      }
    },
  
    async sendVerificationCode(email) {
      try {
        const response = await fetch('http://192.168.91.183:2002/api/auth/send-verification-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        return await response.json();
      } catch (error) {
        throw new Error('Failed to send verification code');
      }
    },
  
    async verifyVerificationCode(email, code) {
      try {
        const response = await fetch('http://192.168.91.183:2002/api/auth/verify-verification-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, code }),
        });
        return await response.json();
      } catch (error) {
        throw new Error('Verification failed');
      }
    },
  
    async forgotPassword(email) {
      try {
        const response = await fetch('http://192.168.91.183:2002/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        return await response.json();
      } catch (error) {
        throw new Error('Password reset request failed');
      }
    },
  
    async changePassword(email, resetToken, newPassword) {
      try {
        const response = await fetch('http://192.168.91.183:2002/api/auth/change-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, resetToken, newPassword }),
        });
        return await response.json();
      } catch (error) {
        throw new Error('Password change failed');
      }
    },
  };

export default apiService;