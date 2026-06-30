import axios from 'axios';

const test = async () => {
  try {
    console.log('1. Attempting login as admin@devboard.com...');
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@devboard.com',
      password: 'admin123',
    });

    console.log('Login Response:', loginRes.data);
    const token = loginRes.data.token;
    const cookie = loginRes.headers['set-cookie'];
    console.log('Cookie received:', cookie);

    console.log('2. Attempting to create project with token in headers...');
    try {
      const projectRes = await axios.post(
        'http://localhost:5000/api/projects',
        {
          name: 'Test Project via Script',
          description: 'A project created by test script',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('Project creation success! Project details:', projectRes.data);
    } catch (err) {
      console.error('Project creation failed with headers! Status:', err.response?.status, 'Data:', err.response?.data);
    }

    if (cookie) {
      console.log('3. Attempting to create project with cookie...');
      try {
        const projectRes = await axios.post(
          'http://localhost:5000/api/projects',
          {
            name: 'Test Project via Cookie',
            description: 'A project created by test script using cookies',
          },
          {
            headers: {
              Cookie: cookie.join('; '),
            },
          }
        );
        console.log('Project creation success with cookie! Project details:', projectRes.data);
      } catch (err) {
        console.error('Project creation failed with cookie! Status:', err.response?.status, 'Data:', err.response?.data);
      }
    }
  } catch (error) {
    console.error('Test script failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
};

test();
